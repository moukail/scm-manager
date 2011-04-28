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

Ext.form.Field.prototype.afterRenderExt = Ext.form.Field.prototype.afterRender;

Ext.override(Ext.form.Field, {

  afterRender : function() {
    if ( this.helpText != null ){
      this.renderHelp( this.helpText );
    }
    this.afterRenderExt.apply(this, arguments);
  },

  renderHelp : function(text){
    var div = this.el.up('div');
    var cls = this.getHelpButtonClass();

    var helpButton = div.createChild({
      tag: 'img',
      width : 16,
      height : 16,
      src: 'resources/images/help.gif',
      cls: cls
    });

    Ext.QuickTips.register({
      target : helpButton,
      title : '',
      text : text,
      enabled : true
    });
  },

  getHelpButtonClass: function(){
    var cls = null;

    switch ( this.getXType() ){
      case 'combo':
        if ( this.readOnly ){
          cls = 'scm-form-help-button';
        } else {
          cls = 'scm-form-combo-help-button';
        }
        break;
      case 'textarea':
        cls = 'scm-form-textarea-help-button';
        break;
      default:
        cls = 'scm-form-help-button';
    }

    return cls;
  }

});


Ext.override(Ext.data.Store,{

  addField: function(field){
    field = new Ext.data.Field(field);
    this.recordType.prototype.fields.replace(field);
    if(typeof field.defaultValue != 'undefined'){
      this.each(function(r){
        if(typeof r.data[field.name] == 'undefined'){
          r.data[field.name] = field.defaultValue;
        }
      });
    }
  },

  removeField: function(name){
    this.recordType.prototype.fields.removeKey(name);
    this.each(function(r){
      delete r.data[name];
      if(r.modified){
        delete r.modified[name];
      }
    });
  }
  
});

Ext.override(Ext.grid.ColumnModel,{

  addColumn: function(column, colIndex){
    if(typeof column == 'string'){
      column = {
        header: column,
        dataIndex: column
      };
    }
    var config = this.config;
    this.config = [];
    if(typeof colIndex == 'number'){
      config.splice(colIndex, 0, column);
    }else{
      colIndex = config.push(column);
    }
    this.setConfig(config);
    return colIndex;
  },

  removeColumn: function(colIndex){
    var config = this.config;
    this.config = [config[colIndex]];
    config.splice(colIndex, 1);
    this.setConfig(config);
  }
  
});

Ext.override(Ext.grid.GridPanel,{

  addColumn: function(field, column, colIndex){
    if(!column){
      if(field.dataIndex){
        column = field;
        field = field.dataIndex;
      } else{
        column = field.name || field;
      }
    }
    this.store.addField(field);
    return this.colModel.addColumn(column, colIndex);
  },
  
  removeColumn: function(name, colIndex){
    this.store.removeField(name);
    if(typeof colIndex != 'number'){
      colIndex = this.colModel.findColumnIndex(name);
    }
    if(colIndex >= 0){
      this.colModel.removeColumn(colIndex);
    }
  }
  
});