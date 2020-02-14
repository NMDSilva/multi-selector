interface ObjInterface {
    label?: string;
    afterOpen?: any;
    afterClose?: any;
    afterAddItem?: any;
    afterRemoveItem?: any;
}

class MultiSelector {
    definicoesDefault: ObjInterface;
    definicoesObj: ObjInterface;
    element: HTMLElement;
    container: HTMLDivElement;
    divElementSelected: HTMLDivElement;
    divListElements: HTMLDivElement;
    constructor(obj: HTMLElement, definicoes?: ObjInterface) {
        if (!obj.hasAttribute('data-seletor')) {
            this.definicoesDefault = {
                label: 'Selecione uma opção',
                afterOpen: null,
                afterClose: null,
                afterAddItem: null,
                afterRemoveItem: null
            };

            this.definicoesObj = { ...this.definicoesDefault, ...definicoes };
            obj.setAttribute('data-seletor', JSON.stringify(this.definicoesObj));
            this.element = obj;
            this._html();
        }
        else { console.warn(`Não pode atribuir a class SeletorMulti ao objecto #${obj.id} multiplas vezes`); }
    }
    _html():void {
        this._createContainer();
        this._createDivElements();
        this._createListEmements();
        this._loadList();
    }

    _createDivElements() {
        this.divElementSelected = document.createElement('div');
        this.divElementSelected.classList.add('seletor-multi');
        this.container.appendChild(this.divElementSelected);
    }

    _createListEmements(): void {
        this.divListElements = document.createElement('div');
        this.divListElements.classList.add('seletor-multi-list');
        this.container.appendChild(this.divListElements);
    }

    _loadList() {
        this.element.querySelectorAll('option').forEach(e => {
            let divElement = document.createElement('div');
            divElement.setAttribute('data-id', e.value);
            divElement.classList.add('item');
            divElement.innerText = e.innerText;
            this.divListElements.appendChild(divElement);
            
        });
    }

    

    _createContainer():void {
        this.container = document.createElement('div');
        this.container.classList.add('seletor-container');
        this.element.before(this.container);
        this.container.appendChild(this.element);
        this.element.style.display = 'none';
        this.container.addEventListener('click', () => {
            if (this.container.classList.contains('open')) { this.close(); }
            else { this.open(); }
        });
    }

    open():void {
        this.container.classList.add('open');
        this.divListElements.classList.add('open');



        // Chamar função após execução caso exista
        if (typeof this.definicoesObj.afterOpen === 'function') { this.definicoesObj.afterOpen(this); }
    }

    close():void {
        this.container.classList.remove('open');
        this.divListElements.classList.remove('open');
        
        
        // Chamar função após execução caso exista
        if (typeof this.definicoesObj.afterClose === 'function') { this.definicoesObj.afterClose(this); }
    }
}