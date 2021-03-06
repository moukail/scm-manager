/**
 * Copyright (c) 2010, Sebastian Sdorra
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice,
 *    this list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution.
 * 3. Neither the name of SCM-Manager; nor the names of its
 *    contributors may be used to endorse or promote products derived from this
 *    software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED.  IN NO EVENT SHALL THE REGENTS OR CONTRIBUTORS BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
 * ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * http://bitbucket.org/sdorra/scm-manager
 *
 */



package sonia.scm.repository;

//~--- non-JDK imports --------------------------------------------------------

import com.google.common.base.Strings;
import com.google.common.collect.Lists;
import com.google.common.io.Closeables;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.tmatesoft.svn.core.SVNErrorCode;
import org.tmatesoft.svn.core.SVNLogEntry;
import org.tmatesoft.svn.core.SVNLogEntryPath;
import org.tmatesoft.svn.core.internal.io.dav.DAVElement;
import org.tmatesoft.svn.core.internal.server.dav.DAVXMLUtil;
import org.tmatesoft.svn.core.internal.util.SVNEncodingUtil;
import org.tmatesoft.svn.core.internal.util.SVNXMLUtil;
import org.tmatesoft.svn.core.io.SVNRepository;
import org.tmatesoft.svn.core.wc.SVNClientManager;
import org.tmatesoft.svn.core.wc.admin.SVNChangeEntry;

import sonia.scm.util.HttpUtil;
import sonia.scm.util.Util;

//~--- JDK imports ------------------------------------------------------------

import java.io.IOException;
import java.io.PrintWriter;

import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 *
 * @author Sebastian Sdorra
 */
public final class SvnUtil
{

  /** Field description */
  public static final String XML_CONTENT_TYPE = "text/xml; charset=\"utf-8\"";

  /** Field description */
  private static final String ID_TRANSACTION_PREFIX = "-1:";

  /**
   * svn path updated
   * same as modified ({@link SVNLogEntryPath#TYPE_MODIFIED})?
   */
  private static final char TYPE_UPDATED = 'U';

  /** Field description */
  private static final String USERAGENT_SVN = "svn/";

  /**
   * the logger for SvnUtil
   */
  private static final Logger logger = LoggerFactory.getLogger(SvnUtil.class);

  /** Field description */
  private static final String ID_TRANSACTION_PATTERN =
    ID_TRANSACTION_PREFIX.concat("%s");

  //~--- constructors ---------------------------------------------------------

  /**
   * Constructs ...
   *
   */
  private SvnUtil() {}

  //~--- methods --------------------------------------------------------------

  /**
   * TODO: type replaced
   *
   *
   * @param modifications
   * @param entry
   */
  public static void appendModification(Modifications modifications,
    SVNLogEntryPath entry)
  {
    appendModification(modifications, entry.getType(), entry.getPath());
  }

  /**
   * Method description
   *
   *
   * @param modifications
   * @param entry
   */
  public static void appendModification(Modifications modifications,
    SVNChangeEntry entry)
  {
    appendModification(modifications, entry.getType(), entry.getPath());
  }

  /**
   * Method description
   *
   *
   * @param modifications
   * @param type
   * @param path
   */
  public static void appendModification(Modifications modifications, char type,
    String path)
  {
    if (path.startsWith("/"))
    {
      path = path.substring(1);
    }

    switch (type)
    {
      case SVNLogEntryPath.TYPE_ADDED :
        modifications.getAdded().add(path);

        break;

      case SVNLogEntryPath.TYPE_DELETED :
        modifications.getRemoved().add(path);

        break;

      case TYPE_UPDATED :
      case SVNLogEntryPath.TYPE_MODIFIED :
        modifications.getModified().add(path);

        break;

      default :
        logger.debug("unknown modification type {}", type);
    }
  }

  /**
   * Method description
   *
   *
   * @param repository
   */
  public static void closeSession(SVNRepository repository)
  {
    if (repository != null)
    {
      try
      {
        repository.closeSession();
      }
      catch (Exception ex)
      {
        logger.error("could not close svn repository session", ex);
      }
    }
  }

  /**
   * Method description
   *
   *
   * @param entry
   *
   * @return
   */
  @SuppressWarnings("unchecked")
  public static Changeset createChangeset(SVNLogEntry entry)
  {
    long revision = entry.getRevision();
    Changeset changeset = new Changeset(String.valueOf(revision),
                            entry.getDate().getTime(),
                            Person.toPerson(entry.getAuthor()),
                            entry.getMessage());

    if (revision > 0)
    {
      changeset.getParents().add(String.valueOf(revision - 1));
    }

    Map<String, SVNLogEntryPath> changeMap = entry.getChangedPaths();

    if (Util.isNotEmpty(changeMap))
    {
      Modifications modifications = changeset.getModifications();

      for (SVNLogEntryPath e : changeMap.values())
      {
        appendModification(modifications, e);
      }
    }

    return changeset;
  }

  /**
   * Method description
   *
   *
   * @param entries
   *
   * @return
   */
  public static List<Changeset> createChangesets(List<SVNLogEntry> entries)
  {
    List<Changeset> changesets = Lists.newArrayList();

    for (SVNLogEntry entry : entries)
    {
      changesets.add(createChangeset(entry));
    }

    return changesets;
  }

  /**
   * Method description
   *
   * @param errorCode
   *
   * @return
   */
  public static String createErrorBody(SVNErrorCode errorCode)
  {
    StringBuffer xmlBuffer = new StringBuffer();

    SVNXMLUtil.addXMLHeader(xmlBuffer);

    List<String> namespaces = Lists.newArrayList(DAVElement.DAV_NAMESPACE,
                                DAVElement.SVN_APACHE_PROPERTY_NAMESPACE);

    SVNXMLUtil.openNamespaceDeclarationTag(SVNXMLUtil.DAV_NAMESPACE_PREFIX,
      DAVXMLUtil.SVN_DAV_ERROR_TAG, namespaces, SVNXMLUtil.PREFIX_MAP,
      xmlBuffer);

    SVNXMLUtil.openXMLTag(SVNXMLUtil.SVN_APACHE_PROPERTY_PREFIX,
      "human-readable", SVNXMLUtil.XML_STYLE_NORMAL, "errcode",
      String.valueOf(errorCode.getCode()), xmlBuffer);
    xmlBuffer.append(
      SVNEncodingUtil.xmlEncodeCDATA(errorCode.getDescription()));
    SVNXMLUtil.closeXMLTag(SVNXMLUtil.SVN_APACHE_PROPERTY_PREFIX,
      "human-readable", xmlBuffer);
    SVNXMLUtil.closeXMLTag(SVNXMLUtil.DAV_NAMESPACE_PREFIX,
      DAVXMLUtil.SVN_DAV_ERROR_TAG, xmlBuffer);

    return xmlBuffer.toString();
  }

  /**
   * Method description
   *
   *
   * @param transaction
   *
   * @return
   */
  public static String createTransactionEntryId(String transaction)
  {
    return String.format(ID_TRANSACTION_PATTERN, transaction);
  }

  /**
   * Method description
   *
   *
   * @param clientManager
   */
  public static void dispose(SVNClientManager clientManager)
  {
    if (clientManager != null)
    {
      try
      {
        clientManager.dispose();
      }
      catch (Exception ex)
      {
        logger.error("could not dispose clientmanager", ex);
      }
    }
  }

  /**
   * Method description
   *
   *
   * @param request
   * @param response
   * @param statusCode
   * @param errorCode
   *
   * @throws IOException
   */
  public static void sendError(HttpServletRequest request,
    HttpServletResponse response, int statusCode, SVNErrorCode errorCode)
    throws IOException
  {
    HttpUtil.drainBody(request);

    response.setStatus(statusCode);
    response.setContentType(XML_CONTENT_TYPE);

    PrintWriter writer = null;

    try
    {
      writer = response.getWriter();
      writer.println(createErrorBody(errorCode));
    }
    finally
    {
      Closeables.close(writer, true);
    }
  }

  //~--- get methods ----------------------------------------------------------

  /**
   * Method description
   *
   *
   * @param revision
   *
   * @return
   *
   * @throws RepositoryException
   */
  public static long getRevisionNumber(String revision)
    throws RepositoryException
  {
    long revisionNumber = -1;

    if (Util.isNotEmpty(revision))
    {
      try
      {
        revisionNumber = Long.parseLong(revision);
      }
      catch (NumberFormatException ex)
      {
        throw new RepositoryException("given revision is not a svnrevision");
      }
    }

    return revisionNumber;
  }

  /**
   * Method description
   *
   *
   * @param id
   *
   * @return
   */
  public static String getTransactionId(String id)
  {
    return id.substring(ID_TRANSACTION_PREFIX.length());
  }

  /**
   * Method description
   *
   *
   * @param request
   *
   * @return
   */
  public static boolean isSvnClient(HttpServletRequest request)
  {
    return HttpUtil.userAgentStartsWith(request, USERAGENT_SVN);
  }

  /**
   * Method description
   *
   *
   * @param id
   *
   * @return
   */
  public static boolean isTransactionEntryId(String id)
  {
    return Strings.nullToEmpty(id).startsWith(ID_TRANSACTION_PREFIX);
  }
}
