(function($, _, Backbone) {
    "use strict";

    var Popover = Backbone.View.extend({
        title           : 'Default Title',
        placement       : 'top',
        initialize      : function(options) {
            this.options = _.extend({
                title       : this.title,
                animate     : false,
                placement   : this.placement
            }, options);

            var self = this;
            $(this.options.target).on('click', function(e) {
                self.onTargetClicked.call(self, e);
            });
//            this.listenTo( $(this.options.target), 'click', this.onTargetClicked );
        },
        render          : function() {
            this.$el.append('foo');
        },
        onTargetClicked : function(e) {
            this.open();
        },
        open            : function() {
            $(this.options.target).popover({
                trigger     : 'manual',
                title       : this.options.title,
                placement   : this.options.placement
            }).popover('show');
            var popoverData = $(this.options.target).data('popover');
            var popover  = popoverData.$tip;
            $(popover).find('.popover-content').append( this.$el );
            this.render();
        },
        close           : function() {
            $(this.options.target).popover('hide');
            $(this.options.target).popover('destroy');
        }
    });


    var editableStringTemplate = '';
    editableStringTemplate += '<div>';
    editableStringTemplate +=   '<div class="input"></div><button class="btn okBtn"><i style="color:green" class="icon-ok"></i></button><button class="btn cancelBtn"><i style="color:red" class="icon-ban-circle"></i></button>';
    editableStringTemplate += '</div>';

    var Editable = Popover.extend({
        template    : editableStringTemplate,
        events      : {
            'click .okBtn '     : 'onOk',
            'click .cancelBtn'  : 'onCancel',
            'keypress input'    : 'onKeypress',
            'keyup input'       : 'onKeyup'
        },
        initialize   : function(options) {
            Popover.prototype.initialize.apply(this, arguments);

            switch( this.options.type ) {
                case 'date':
                    this.subview = new EditableDate(this.options);
                    break;
                case 'string':
                    this.subview =  new EditableString(this.options);
                    break;
                case 'select':
                    this.subview = new EditableSelect(this.options);
                    break;
                default:
                    throw('Please specify a type, like "string"');
            }
        },
        render      : function(){
            this.$el.html( _.template(this.template)() );
            this.subview.render();
            this.$el.find('.input').html(this.subview.$el);
            this.subview.val( this.model.get(this.options.fieldname) );
        },
        onKeyup     : function(e) {
            if( e.keyCode == 27 ) {
                this.close();
            }
        },
        onKeypress  : function(e) {
            if( e.charCode == 13 ) {
                this.onOk();
            }
        },
        onOk        : function() {
            var fieldname = this.options.fieldname;
            var value = this.subview.val();
            var data = {};
            data[fieldname] = value;

            this.model.set(data);
        },
        onCancel    : function() {
            this.close();
        }
    });

    var EditableString = Backbone.View.extend({
        template    : '<input type="text">',
        render      : function() {
            var self = this;
            this.$el.html(_.template(this.template)() );
        },
        val         : function(value) {
            if( value ) {
                this.$el.find('input').val(value);
            }else{
                return this.$el.find('input').val();
            }

        }
    });

    var EditableDate = Backbone.View.extend({
        // http://www.eyecon.ro/bootstrap-datepicker/
        template    : '<div class="errors"></div><div class="input-append"><input type="text"><span class="add-on"><i class="icon-calendar"></i></span></div>',
        initialize  : function(options) {
            this.options = _.extend({
                title: this.title,
                animate: false
            }, options);
        },
        render      : function() {
            var self=this;

            this.$el.html(_.template(this.template)() );
            var datepicker = this.$el.find('input').datepicker();

            //!!ABL todo: clean this goofy-ness up
            datepicker.on('changeDate', function(e) {
                self.$el.find('input').datepicker('hide');
            });
        },
        val             : function(value) {
            if( value ) {
                this.$el.find('input').datepicker('setValue', value);
            }else{
                return this.$el.find('input').val();
            }

        }
    });

    var EditableSelect = Backbone.View.extend({
        template    : '<select></select>',
        initialize  : function(options) {
            this.options = _.extend({
                title: this.title,
                animate: false
            }, options);
        },
        render      : function() {
            this.$el.html(_.template(this.template)() );
            var select = this.$el.find('select');
            var optionTemplate = _.template('<option value="<%= value %>"><%= name %></option>');
            _.each( this.options.options, function(item, index) {
                select.append( optionTemplate({value:item[0], name:item[1]}) );
            }, this);
        },
        val         : function(value) {
            if( value ) {
                this.$el.find('select').val(value);
            }else{
                return this.$el.find('select').val();
            }
        }
    });


  //EXPORTS
  //CommonJS
  if (typeof require == 'function' && typeof module !== 'undefined' && exports) {
    module.exports = Popover;
  }

  //AMD / RequireJS
  if (typeof define === 'function' && define.amd) {
    return define(function() {
      Backbone.Modal = Popover;
    })
  }

  //Regular; add to Backbone.Modal
  else {
    Backbone.Popover = Popover;
    Backbone.Editable = Editable;
  }

})(jQuery, _, Backbone);