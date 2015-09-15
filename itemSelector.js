ItemSelector = (function ($) {
  if (!$) throw 'jQuery is required!';
  var defaultItemTemplate = '<div class="item-select"><label class="js-label"></label><input></div>';

  function ItemSelector(opts) {
    this.$el = opts.$el;
    this.multiple = opts.multiple;
    this.itemTemplate = opts.itemTemplate || defaultItemTemplate;
    this.collection = opts.collection || [];
    this.textProp = opts.textProp || 'text';
    this.valProp = opts.valProp || 'val';
    this.containerType = opts.containerType || 'div';
    this.name = opts.name || (function () {
      throw "`name` is required";
    })();

    this._selected = {};
    this._triggerItemEvent = this._triggerItemEvent.bind(this);

  }

  ItemSelector.prototype.render = function (opts) {

    this.$el = this.$el || $('<' + this.containerType + '>');

    this.renderCollection(opts);

    return this;
  };

  ItemSelector.prototype.renderCollection = function (opts) {
    var collection, template;
    opts = opts || {};

    if (typeof opts === 'string') {
      opts = {
        template: opts
      };
    }

    template = opts.template || this.itemTemplate;
    collection = opts.collection || this.collection;

    this.$el.empty();

    for (var item in collection) {
      this.$el.append(this.renderItem(collection[item], template));
    }
  };

  ItemSelector.prototype.renderItem = function (model, template) {
    if (!model) return;
    var $itemEl;
    template = template || this.itemTemplate;

    $itemEl = $(template).data('model', JSON.stringify(model));

    $itemEl.find('.js-label')
      .text(model[this.textProp])
      .attr('for', model[this.valProp]);

    $itemEl.find('input')
      .attr({
        name : this.name,
        type : this.multiple ? 'checkbox' : 'radio',
        id   : model[this.valProp],
        value: model[this.valProp]
      });

    $itemEl.on('click change mouseenter mouseleave', null, model, this._triggerItemEvent);

    return $itemEl;
  };

  ItemSelector.prototype._triggerItemEvent = function ($e) {
    switch ($e.type) {
      case 'change':
        this.onItemChange($e.data, $($e.target).prop('checked'), $e);
    }

    this.$el.trigger('item.' + $e.type, [$e.data, this.collection]);
  };

  ItemSelector.prototype.onItemChange = function (model, selected, $event) {
    if (selected) {
      this._selected[model[this.valProp]] = model;
    } else {
      delete this._selected[model[this.valProp]];
    }
  };

  ItemSelector.prototype.on = function (event, cb) {
    this.$el.on(event, cb);
  };

  ItemSelector.prototype.getSelected = function (fullModel) {
    return fullModel ?
      getValues(this._selected) :
      Object.keys(this._selected);
  };

  ItemSelector.prototype.setCollection = function (opts) {
    var collection, oldCollection,
        render = true;

    if ($.isPlainObject(opts)) {
      collection = opts.collection;
    } else if ($.isArray(opts)) {
      collection = opts;
    } else {
      throw "A collection must be passed";
    }

    if (!$.isArray(collection)) {
      throw "collection must be array";
    }

    if (opts.render !== void 0) {
      render = opts.render;
    }

    oldCollection = this.collection;
    this.collection = collection;

    this.$el.trigger('collection.change', [collection, oldCollection]);

    if (render) {
      this.render(opts);
    }
  };

  // Hijacked from underscore.js source
  function getValues(obj) {
    var keys = Object.keys(obj);
    var length = keys.length;
    var values = Array(length);
    for (var i = 0; i < length; i++) {
      values[i] = obj[keys[i]];
    }
    return values;
  }

  runTests();

  return ItemSelector;

  function runTests() {
    getSelected();
    render();
  }

  function getSelected() {
    var col = [
      {
        text: '1',
        val : '1'
      },
      {
        text: '2',
        val : '2'
      },
      {
        text: '3',
        val : '3'
      },
      {
        text: '4',
        val : '4'
      }
    ];

    var sel = new ItemSelector({
      collection: col,
      multiple  : true,
      name      : 'test'
    });

    sel.render().$el.find('input').prop('checked', true).trigger('change');
    console.log(
      "Selected should be " + col.length,
      sel.getSelected().length === col.length
    );

    sel.$el.find('input').first().prop('checked', false).trigger('change');
    console.log(
      "Selected should be " + (col.length - 1),
      sel.getSelected().length === (col.length - 1)
    );

    console.log(
      "Selected should be in originol array, ",
      col.indexOf(sel.getSelected(true)[0]) > -1
    );
  }

  function render() {
    var col1 = [
      {
        text: '1',
        val : '1'
      },
      {
        text: '2',
        val : '2'
      },
      {
        text: '3',
        val : '3'
      },
      {
        text: '4',
        val : '4'
      }
    ];

    var col2 = [
      {
        text: '5',
        val : '5'
      },
      {
        text: '6',
        val : '6'
      }
    ];

    var sel = new ItemSelector({
      collection: col1,
      multiple  : true,
      name      : 'test'
    });

    sel.render();

    console.log(
      "input count should be " + col1.length,
      sel.$el.find('input').length === col1.length
    );

    sel.setCollection(col2);

    console.log(
      "input count should be " + col2.length,
      sel.$el.find('input').length === col2.length
    );
  }

})(jQuery || $);
