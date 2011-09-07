/* *
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


Sonia.repository.SettingsFormPanel = Ext.extend(Sonia.repository.FormPanel, {

  initComponent: function(){
    var update = this.item != null;

    var config = {
      title: this.formTitleText,
      items: [{
        id: 'repositoryName',
        fieldLabel: this.nameText,
        name: 'name',
        readOnly: update,
        allowBlank: false,
        helpText: this.nameHelpText,
        vtype: 'name'
      },{
       fieldLabel: this.typeText,
       name: 'type',
       xtype: 'combo',
       readOnly: update,
       hiddenName : 'type',
       typeAhead: true,
       triggerAction: 'all',
       lazyRender: true,
       mode: 'local',
       editable: false,
       store: repositoryTypeStore,
       valueField: 'name',
       displayField: 'displayName',
       allowBlank: false,
       helpText: this.typeHelpText
      },{
        fieldLabel: this.contactText,
        name: 'contact',
        vtype: 'email',
        helpText: this.contactHelpText
      },{
        fieldLabel: this.descriptionText,
        name: 'description',
        xtype: 'textarea',
        helpText: this.descriptionHelpText
      },{
        fieldLabel: this.publicText,
        name: 'public',
        xtype: 'checkbox',
        helpText: this.publicHelpText
      }]
    };

    Ext.apply(this, Ext.apply(this.initialConfig, config));
    Sonia.repository.SettingsFormPanel.superclass.initComponent.apply(this, arguments);
  }

});

// register xtype
Ext.reg('repositorySettingsForm', Sonia.repository.SettingsFormPanel);