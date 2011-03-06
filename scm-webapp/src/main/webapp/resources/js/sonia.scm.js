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

Ext.ns("Sonia.scm");

Sonia.scm.Main = Ext.extend(Ext.util.Observable, {

  tabRepositoriesText: 'Repositories',
  navChangePasswordText: 'Change Password',
  sectionMainText: 'Main',
  sectionSecurityText: 'Security',
  navRepositoriesText: 'Repositories',
  sectionConfigText: 'Config',
  navGeneralConfigText: 'General',
  tabGeneralConfigText: 'SCM Config',

  navRepositoryTypesText: 'Repository Types',
  tabRepositoryTypesText: 'Repository Config',
  navPluginsText: 'Plugins',
  tabPluginsText: 'Plugins',
  navUsersText: 'Users',
  tabUsersText: 'Users',
  navGroupsText: 'Groups',
  tabGroupsText: 'Groups',

  sectionLoginText: 'Login',
  navLoginText: 'Login',

  sectionLogoutText: 'Log out',
  navLogoutText: 'Log out',

  mainTabPanel: null,

  constructor : function(config) {
    this.mainTabPanel = Ext.getCmp('mainTabPanel');
    Sonia.scm.Main.superclass.constructor.call(this, config);
  },

  createRepositoryPanel: function(){
    if ( debug ){
      console.debug('create repository panel');
    }
    this.mainTabPanel.add({
      id: 'repositories',
      xtype: 'repositoryPanel',
      title: this.tabRepositoriesText,
      closeable: false,
      autoScroll: true
    });
    this.mainTabPanel.setActiveTab('repositories');
  },

  createMainMenu: function(){
    if ( debug ){
      console.debug('create main menu');
    }
    var panel = Ext.getCmp('navigationPanel');
    panel.addSection({
      id: 'navMain',
      title: this.sectionMainText,
      items: [{
        label: this.navRepositoriesText,
        fn: function(){
          this.mainTabPanel.setActiveTab('repositories');
        },
        scope: this
      }]
    });

    var securitySection = null;

    if ( state.user.type == 'xml' && state.user.name != 'anonymous' ){
      securitySection = {
        title: this.sectionSecurityText,
        items: [{
          label: this.navChangePasswordText,
          fn: function(){
            new Sonia.action.ChangePasswordWindow().show();
          }
        }]
      }
    }

    if ( admin ){

      panel.addSections([{
        id: 'navConfig',
        title: this.sectionConfigText,
        items: [{
          label: this.navGeneralConfigText,
          fn: function(){
            this.addTabPanel("scmConfig", "scmConfig", this.navGeneralConfigText);
          },
          scope: this
        },{
          label: this.navRepositoryTypesText,
          fn: function(){
            this.addTabPanel('repositoryConfig', 'repositoryConfig', this.tabRepositoryTypesText);
          },
          scope: this
        },{
          label: this.navPluginsText,
          fn: function(){
            this.addTabPanel('plugins', 'pluginGrid', this.navPluginsText);
          },
          scope: this
        }]
      }]);

      if ( securitySection == null ){
        securitySection = {
          title: this.sectionSecurityText,
          items: []
        }
      }

      securitySection.items.push({
        label: this.navUsersText,
        fn: function(){
          this.addTabPanel('users', 'userPanel', this.navUsersText);
        },
        scope: this
      });
      securitySection.items.push({
        label: this.navGroupsText,
        fn: function(){
          this.addTabPanel('groups', 'groupPanel', this.tabGroupsText);
        },
        scope: this
      });
    }

    if ( securitySection != null ){
      panel.addSection( securitySection );
    }

    if ( state.user.name == 'anonymous' ){
      panel.addSection({
        id: 'navLogin',
        title: this.sectionLoginText,
        items: [{
          label: this.sectionLoginText,
          fn: this.login,
          scope: this
        }]
      });
    } else {
      panel.addSection({
        id: 'navLogout',
        title: this.sectionLogoutText,
        items: [{
          label: this.navLogoutText,
          fn: this.logout,
          scope: this
        }]
      });
    }

    //fix hidden logout button
    panel.doLayout();
  },

  addTabPanel: function(id, xtype, title){
    var tab = this.mainTabPanel.findById( id );
    if ( tab == null ){
      this.mainTabPanel.add({
        id: id,
        xtype: xtype,
        title: title,
        closable: true,
        autoScroll: true
      });
    }
    this.mainTabPanel.setActiveTab(id);
  },


  execCallbacks: function(callbacks, param){
    Ext.each(callbacks, function(callback){
      if ( Ext.isFunction(callback) ){
        callback(state);
      } else if (Ext.isObject(callback)) {
        callback.fn.call( callback.scope, param );
      } else if (debug){
        console.debug( "callback is not a function or object. " + callback );
      }
    });
  },

  loadState: function(s){
    if ( debug ){
      console.debug( s );
    }
    state = s;
    admin = s.user.admin;
    // call login callback functions
    this.execCallbacks(loginCallbacks, state);
  },

  clearState: function(){
    // clear state
    state = null;
    // clear repository store
    repositoryTypeStore.removeAll();
    // remove all tabs
    this.mainTabPanel.removeAll();
    // remove navigation items
    Ext.getCmp('navigationPanel').removeAll();
  },

  checkLogin: function(){
    Ext.Ajax.request({
      url: restUrl + 'authentication.json',
      method: 'GET',
      scope: this,
      success: function(response){
        if ( debug ){
          console.debug('login success');
        }
        var s = Ext.decode(response.responseText);
        this.loadState(s);
      },
      failure: function(){
        if ( debug ){
          console.debug('login failed');
        }
        var loginWin = new Sonia.login.Window();
        loginWin.show();
      }
    });
  },

  login: function(){
    this.clearState();
    var loginWin = new Sonia.login.Window();
    loginWin.show();
  },

  logout: function(){
    Ext.Ajax.request({
      url: restUrl + 'authentication/logout.json',
      method: 'GET',
      scope: this,
      success: function(response){
        if ( debug ){
          console.debug('logout success');
        }
        this.clearState();
        // call logout callback functions
        this.execCallbacks(logoutCallbacks, state);

        var s = null;
        var text = response.responseText;
        if ( text != null && text.length > 0 ){
          s = Ext.decode( text );
        }
        if ( s != null && s.success ){
          this.loadState(s);
        } else {
          // show login window
          var loginWin = new Sonia.login.Window();
          loginWin.show();
        }
      },
      failure: function(){
        if ( debug ){
          console.debug('logout failed');
        }
        Ext.Msg.alert('Logout Failed!');
      }
    });
  }

});

Ext.onReady(function(){

  Ext.state.Manager.setProvider(new Ext.state.CookieProvider());

  var mainTabPanel = new Ext.TabPanel({
    id: 'mainTabPanel',
    region: 'center',
    deferredRender: false
  });

  new Ext.Viewport({
    layout: 'border',
    items: [
    new Ext.BoxComponent({
      region: 'north',
      id: 'north-panel',
      contentEl: 'north',
      height: 75
    }), {
      region: 'west',
      id: 'navigationPanel',
      title: 'Navigation',
      xtype: 'navPanel',
      split: true,
      width: 200,
      minSize: 175,
      maxSize: 400,
      collapsible: true,
      margins: '0 0 0 5'
    },
    new Ext.BoxComponent({
      region: 'south',
      id: 'south-panel',
      contentEl: 'south',
      height: 16,
      margins: '2 2 2 5'
    }),
    mainTabPanel
    ]
  });

  main = new Sonia.scm.Main();
  main.checkLogin();

  /**
   * Adds a tab to main TabPanel
   *
   * @deprecated use main.addTabPanel
   */
  function addTabPanel(id, xtype, title){
    main.addTabPanel(id, xtype, title);
  }

  // register login callbacks

  // create menu
  loginCallbacks.splice(0, 0, {fn: main.createMainMenu, scope: main});
  // add repository tab
  loginCallbacks.push({fn: main.createRepositoryPanel, scope: main});

});