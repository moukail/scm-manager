/**
 * Copyright (c) 2010, Sebastian Sdorra All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice,
 * this list of conditions and the following disclaimer. 2. Redistributions in
 * binary form must reproduce the above copyright notice, this list of
 * conditions and the following disclaimer in the documentation and/or other
 * materials provided with the distribution. 3. Neither the name of SCM-Manager;
 * nor the names of its contributors may be used to endorse or promote products
 * derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE REGENTS OR CONTRIBUTORS BE LIABLE FOR
 * ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * http://bitbucket.org/sdorra/scm-manager
 *
 */



package sonia.scm.annotation;

//~--- non-JDK imports --------------------------------------------------------

import org.w3c.dom.Document;
import org.w3c.dom.Element;

/**
 *
 * @author Sebastian Sdorra
 */
public class SubscriberElement implements DescriptorElement
{

  /** Field description */
  private static final String EL_CLASS = "class";

  /** Field description */
  private static final String EL_EVENT = "event";

  /** Field description */
  private static final String EL_SUBSCRIBER = "subscriber";

  //~--- constructors ---------------------------------------------------------

  /**
   * Constructs ...
   *
   *
   * @param subscriberType
   * @param eventType
   */
  public SubscriberElement(String subscriberType, String eventType)
  {
    this.subscriberType = subscriberType;
    this.eventType = eventType;
  }

  //~--- methods --------------------------------------------------------------

  /**
   * Method description
   *
   *
   * @param doc
   * @param root
   */
  @Override
  public void append(Document doc, Element root)
  {
    Element subscriberEl = doc.createElement(EL_SUBSCRIBER);
    Element classEl = doc.createElement(EL_CLASS);

    classEl.setTextContent(subscriberType);
    subscriberEl.appendChild(classEl);

    Element eventEl = doc.createElement(EL_EVENT);

    eventEl.setTextContent(eventType);
    subscriberEl.appendChild(eventEl);
    root.appendChild(subscriberEl);
  }

  //~--- fields ---------------------------------------------------------------

  /** Field description */
  private final String eventType;

  /** Field description */
  private final String subscriberType;
}
