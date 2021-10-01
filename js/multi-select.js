var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var MultiSelect = /** @class */ (function () {
    function MultiSelect(obj, defenitions) {
        var _this = this;
        this.defaultDefinitions = {
            target: null,
            label: 'Select an Item..',
            value: [],
            items: [],
            emptyItems: [{ id: '', value: 'No items to choose...' }],
            maxTextTag: 10,
            maxTextItem: null,
            afterOpen: null,
            afterClose: null,
            afterAddItem: null,
            afterRemoveItem: null,
            loading: false,
            txtLoading: 'Loading...'
        };
        this.container = document.createElement('div');
        this.divElementSelected = document.createElement('div');
        this.divListElements = document.createElement('div');
        this.divLoading = document.createElement('div');
        this.inputTarget = document.createElement('input');
        this.selectionItems = [];
        this._closeEventHandler = function (_a) {
            var target = _a.target;
            if (target.classList.contains('item') || target.classList.contains('multi-select')) {
                return;
            }
            else {
                _this.close();
            }
        };
        if (!obj.hasAttribute('data-select')) {
            this.objDefinitions = __assign(__assign({}, this.defaultDefinitions), defenitions);
            obj.setAttribute('data-select', '1');
            this.element = obj;
            this._html();
            if (this.element.tagName === 'SELECT' && this.objDefinitions.items.length === 0) {
                this.element.querySelectorAll('option').forEach(function (o) {
                    _this.objDefinitions.items.push({ id: o.value, value: o.innerText });
                });
            }
            this._loadList(this.objDefinitions.items);
        }
        else {
            console.warn("You can't assign multiple times the class MultiSelect to #" + obj.id);
        }
    }
    MultiSelect.prototype.createItem = function (item, eventAdd) {
        var _this = this;
        if (eventAdd === void 0) { eventAdd = true; }
        if (!this.exists(item.id)) {
            var divElement_1 = document.createElement('div');
            divElement_1.dataset.id = item.id;
            divElement_1.dataset.item = JSON.stringify(item);
            divElement_1.classList.add('item');
            if (this.objDefinitions.maxTextItem && item.value.length > this.objDefinitions.maxTextItem) {
                divElement_1.setAttribute('title', item.value);
                item.value = item.value.substr(0, this.objDefinitions.maxTextItem) + '...';
            }
            divElement_1.innerText = item.value;
            this.divListElements.appendChild(divElement_1);
            if (eventAdd) {
                divElement_1.addEventListener('click', function () {
                    if (divElement_1.classList.contains('checked')) {
                        _this.removeItem(item.id);
                    }
                    else {
                        _this.addItem(item.id);
                    }
                });
            }
        }
        else {
            console.warn("The id " + item.id + " already exists on MultiSelect");
        }
    };
    MultiSelect.prototype.deleteItem = function (id) {
        if (this.exists(id)) {
            this.divListElements.querySelector("div[data-id='" + id + "']").remove();
            if (this.divListElements.querySelectorAll('div[data-id]').length === 0) {
                this._noItems();
            }
        }
    };
    MultiSelect.prototype.setValues = function (items) {
        var _this = this;
        if (typeof items !== 'undefined') {
            if (!Array.isArray(items)) {
                items = [items];
            }
            items.map(function (id) {
                if (!_this.isChecked(id) && _this.exists(id)) {
                    _this.addItem(id);
                }
            });
        }
    };
    MultiSelect.prototype.isChecked = function (id) { return (this.selectionItems.filter(function (i) { return String(i.id) === String(id); }).length !== 0); };
    MultiSelect.prototype.exists = function (id) { return (this.divListElements.querySelector("div[data-id='" + id + "']") !== null); };
    MultiSelect.prototype.addItem = function (idElement) {
        var divElement = this.divListElements.querySelector(".item[data-id=\"" + idElement + "\"]");
        divElement.classList.add('checked');
        this.selectionItems.push({ id: idElement, tag: divElement.innerText });
        //this.selectionTags.push(divElement.innerText);
        // Render Selection
        this._renderItemsValues();
        // Chamar função após execução caso exista
        if (typeof this.objDefinitions.afterAddItem === 'function') {
            this.objDefinitions.afterAddItem(JSON.parse(divElement.dataset.item));
        }
    };
    MultiSelect.prototype.removeItem = function (idElement) {
        var divElement = this.divListElements.querySelector(".item[data-id=\"" + idElement + "\"]");
        divElement.classList.remove('checked');
        this.selectionItems = this.selectionItems.filter(function (i) { return String(i.id) !== String(idElement); });
        // Render Selection
        this._renderItemsValues();
        // Chamar função após execução caso exista
        if (typeof this.objDefinitions.afterRemoveItem === 'function') {
            this.objDefinitions.afterRemoveItem(JSON.parse(divElement.dataset.item));
        }
    };
    MultiSelect.prototype.open = function () {
        if (!this.divListElements.classList.contains('open')) {
            this.divElementSelected.classList.add('open');
            this.divListElements.classList.add('open');
            document.addEventListener('click', this._closeEventHandler, false);
            if (typeof this.objDefinitions.afterOpen === 'function') {
                this.objDefinitions.afterOpen(this);
            }
        }
    };
    MultiSelect.prototype.close = function () {
        if (this.divListElements.classList.contains('open')) {
            this.divElementSelected.classList.remove('open');
            this.divListElements.classList.remove('open');
            document.removeEventListener('click', this._closeEventHandler, false);
            if (typeof this.objDefinitions.afterClose === 'function') {
                this.objDefinitions.afterClose(this);
            }
        }
    };
    MultiSelect.prototype.setItems = function (items) {
        this.divListElements.querySelectorAll('.item').forEach(function (i) {
            i.remove();
        });
        this._renderItemsValues();
        this._loadList(items);
    };
    MultiSelect.prototype._createContainer = function () {
        this.container.classList.add('select-container');
        this.element.before(this.container);
        this.container.appendChild(this.element);
        this.element.style.display = 'none';
    };
    MultiSelect.prototype._html = function () {
        this._createContainer();
        this._createHiddenField();
        this._createDivElements();
        this._createListEmements();
    };
    MultiSelect.prototype._createHiddenField = function () {
        if (this.objDefinitions.target === null) {
            this.inputTarget.setAttribute('type', 'hidden');
            this.inputTarget.setAttribute('name', this.element.getAttribute('name'));
            this.element.removeAttribute('name');
            this.container.appendChild(this.inputTarget);
        }
        else {
            this.inputTarget = document.querySelector(this.objDefinitions.target);
        }
    };
    MultiSelect.prototype._createDivElements = function () {
        var _this = this;
        this.divElementSelected.classList.add('multi-select');
        var txtLoading = '';
        if (this.objDefinitions.loading) {
            this.divLoading.classList.add('loading');
            this.divElementSelected.appendChild(this.divLoading);
            txtLoading = this.objDefinitions.txtLoading;
        }
        var spanLabel = document.createElement('span');
        spanLabel.innerText = txtLoading || this.objDefinitions.label;
        this.divElementSelected.appendChild(spanLabel);
        this.divElementSelected.addEventListener('click', function () {
            if (_this.divElementSelected.classList.contains('open')) {
                _this.close();
            }
            else {
                _this.open();
            }
        });
        this.container.appendChild(this.divElementSelected);
    };
    MultiSelect.prototype._createListEmements = function () {
        this.divListElements.classList.add('multi-select-list');
        this.container.appendChild(this.divListElements);
    };
    MultiSelect.prototype._loadList = function (items) {
        var _this = this;
        if (items.length > 0) {
            items.map(function (item) { return _this.createItem(item); });
            if (this.objDefinitions.value.length) {
                this.setValues(this.objDefinitions.value);
                this.objDefinitions.value = [];
            }
        }
        else {
            this._noItems();
        }
    };
    MultiSelect.prototype._noItems = function () {
        var _this = this;
        if (this.objDefinitions.emptyItems.length) {
            this.objDefinitions.emptyItems.map(function (item) { return _this.createItem(item, false); });
        }
    };
    MultiSelect.prototype._renderItemsValues = function () {
        var _this = this;
        this.divElementSelected.innerText = '';
        if (this.selectionItems.length) {
            var maxLength_1 = this.divElementSelected.offsetWidth - 25;
            var tagsLength_1 = 0;
            var tagsHidden_1 = 0;
            this.divElementSelected.removeAttribute('data-tags-hidden');
            this.divElementSelected.classList.remove('hidden-tags');
            this.selectionItems.map(function (o) {
                var tag = document.createElement('div');
                tag.classList.add('tag');
                tag.innerText = o.tag.substr(0, _this.objDefinitions.maxTextTag) + ((o.tag.length > _this.objDefinitions.maxTextTag) ? '...' : '');
                tag.setAttribute('data-id', o.id);
                _this.divElementSelected.appendChild(tag);
                tagsLength_1 += tag.offsetWidth;
                if (tagsLength_1 >= maxLength_1) {
                    tag.style.display = 'none';
                    tagsHidden_1++;
                    _this.divElementSelected.classList.add('hidden-tags');
                    _this.divElementSelected.setAttribute('data-tags-hidden', '+' + String(tagsHidden_1));
                }
                tag.addEventListener('click', function (e) {
                    e.stopPropagation();
                    _this.removeItem(o.id);
                    _this.close();
                });
            });
        }
        else {
            this.divElementSelected.innerHTML = this.objDefinitions.label;
        }
        var itemIDs = [];
        this.selectionItems.map(function (o) { itemIDs.push(o.id); });
        this.inputTarget.value = itemIDs.sort().join(', ');
    };
    return MultiSelect;
}());
