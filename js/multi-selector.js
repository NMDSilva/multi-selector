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
var MultiSelector = /** @class */ (function () {
    function MultiSelector(obj, definicoes) {
        if (!obj.hasAttribute('data-seletor')) {
            this.definicoesDefault = {
                label: 'Selecione uma opção',
                afterOpen: null,
                afterClose: null,
                afterAddItem: null,
                afterRemoveItem: null
            };
            this.definicoesObj = __assign(__assign({}, this.definicoesDefault), definicoes);
            obj.setAttribute('data-seletor', JSON.stringify(this.definicoesObj));
            this.element = obj;
            this._html();
        }
        else {
            console.warn("N\u00E3o pode atribuir a class SeletorMulti ao objecto #" + obj.id + " multiplas vezes");
        }
    }
    MultiSelector.prototype._html = function () {
        this._createContainer();
        this._createDivElements();
        this._createListEmements();
        this._loadList();
    };
    MultiSelector.prototype._createDivElements = function () {
        this.divElementSelected = document.createElement('div');
        this.divElementSelected.classList.add('seletor-multi');
        this.container.appendChild(this.divElementSelected);
    };
    MultiSelector.prototype._createListEmements = function () {
        this.divListElements = document.createElement('div');
        this.divListElements.classList.add('seletor-multi-list');
        this.container.appendChild(this.divListElements);
    };
    MultiSelector.prototype._loadList = function () {
        var _this = this;
        this.element.querySelectorAll('option').forEach(function (e) {
            var divElement = document.createElement('div');
            divElement.setAttribute('data-id', e.value);
            divElement.classList.add('item');
            divElement.innerText = e.innerText;
            _this.divListElements.appendChild(divElement);
        });
    };
    MultiSelector.prototype._createContainer = function () {
        var _this = this;
        this.container = document.createElement('div');
        this.container.classList.add('seletor-container');
        this.element.before(this.container);
        this.container.appendChild(this.element);
        this.element.style.display = 'none';
        this.container.addEventListener('click', function () {
            if (_this.container.classList.contains('open')) {
                _this.close();
            }
            else {
                _this.open();
            }
        });
    };
    MultiSelector.prototype.open = function () {
        this.container.classList.add('open');
        this.divListElements.classList.add('open');
        // Chamar função após execução caso exista
        if (typeof this.definicoesObj.afterOpen === 'function') {
            this.definicoesObj.afterOpen(this);
        }
    };
    MultiSelector.prototype.close = function () {
        this.container.classList.remove('open');
        this.divListElements.classList.remove('open');
        // Chamar função após execução caso exista
        if (typeof this.definicoesObj.afterClose === 'function') {
            this.definicoesObj.afterClose(this);
        }
    };
    return MultiSelector;
}());
