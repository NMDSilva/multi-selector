interface ObjInterface {
  label?: string;
  value?: any[];
  items?: any[];
  emptyItems?: any[];
  target?: string;
  maxTextTag?: number;
  maxTextItem?: number;
  afterOpen?: any;
  afterClose?: any;
  afterAddItem?: any;
  afterRemoveItem?: any;
  loading: boolean;
  txtLoading: string;
}

class MultiSelect {
  defaultDefinitions: ObjInterface = {
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
  objDefinitions: ObjInterface;
  element: HTMLElement;
  container: HTMLDivElement = document.createElement('div');
  divElementSelected: HTMLDivElement = document.createElement('div');
  divListElements: HTMLDivElement = document.createElement('div');
  divLoading: HTMLDivElement = document.createElement('div');
  inputTarget: HTMLInputElement = document.createElement('input');
  selectionItems: any[] = [];
  
  constructor(obj: HTMLElement, defenitions?: ObjInterface) {
    if (!obj.hasAttribute('data-select')) {
      this.objDefinitions = { ...this.defaultDefinitions, ...defenitions };
      obj.setAttribute('data-select', '1');
      this.element = obj;
      this._html();
      if (this.element.tagName === 'SELECT' && this.objDefinitions.items.length === 0) {
        this.element.querySelectorAll('option').forEach(o => {
          this.objDefinitions.items.push({ id: o.value, value: o.innerText });
        });
      }
      this._loadList(this.objDefinitions.items);
    }
    else { console.warn(`You can't assign multiple times the class MultiSelect to #${obj.id}`); }
  }
  
  createItem(item: any, eventAdd: boolean = true) {
    if (!this.exists(item.id)) {
      let divElement = document.createElement('div');
      divElement.dataset.id = item.id;
      divElement.dataset.item = JSON.stringify(item);
      divElement.classList.add('item');
      if (this.objDefinitions.maxTextItem && item.value.length > this.objDefinitions.maxTextItem) {
        divElement.setAttribute('title', item.value);
        item.value = item.value.substr(0, this.objDefinitions.maxTextItem) + '...';
      }
      divElement.innerText = item.value;
      this.divListElements.appendChild(divElement);
      if (eventAdd) {
        divElement.addEventListener('click', () => {
          if (divElement.classList.contains('checked')) { this.removeItem(item.id); }
          else { this.addItem(item.id); }
        });
      }
    }
    else { console.warn(`The id ${item.id} already exists on MultiSelect`); }
  }
  
  deleteItem(id: any) {
    if (this.exists(id)) {
      this.divListElements.querySelector(`div[data-id='${id}']`).remove();
      if (this.divListElements.querySelectorAll('div[data-id]').length === 0) { this._noItems(); }
    }
  }
  
  setValues(items: any[]) {
    if (typeof items !== 'undefined') {
      if (!Array.isArray(items)) { items = [items]; }
      items.map(id => {
        if (!this.isChecked(id) && this.exists(id)) {
          this.addItem(id);
        }
      });
    }
  }
  
  isChecked(id: any) { return (this.selectionItems.filter(i => String(i.id) === String(id)).length !== 0); }
  
  exists(id: any) { return (this.divListElements.querySelector(`div[data-id='${id}']`) !== null); }
  
  addItem(idElement: any): void {
    let divElement: HTMLDivElement = this.divListElements.querySelector(`.item[data-id="${idElement}"]`);
    divElement.classList.add('checked');
    
    this.selectionItems.push({ id: idElement, tag: divElement.innerText });
    //this.selectionTags.push(divElement.innerText);
    
    // Render Selection
    this._renderItemsValues();
    
    // Chamar função após execução caso exista
    if (typeof this.objDefinitions.afterAddItem === 'function') {
      this.objDefinitions.afterAddItem(JSON.parse(divElement.dataset.item));
    }
  }
  
  removeItem(idElement: any): void {
    let divElement: HTMLDivElement = this.divListElements.querySelector(`.item[data-id="${idElement}"]`);
    divElement.classList.remove('checked');
    
    this.selectionItems = this.selectionItems.filter(i => String(i.id) !== String(idElement));
    
    // Render Selection
    this._renderItemsValues();
    
    // Chamar função após execução caso exista
    if (typeof this.objDefinitions.afterRemoveItem === 'function') {
      this.objDefinitions.afterRemoveItem(JSON.parse(divElement.dataset.item));
    }
  }
  
  open(): void {
    if (!this.divListElements.classList.contains('open')) {
      this.divElementSelected.classList.add('open');
      this.divListElements.classList.add('open');
      
      document.addEventListener('click', this._closeEventHandler, false);
      
      if (typeof this.objDefinitions.afterOpen === 'function') {
        this.objDefinitions.afterOpen(this);
      }
    }
  }
  
  close(): void {
    if (this.divListElements.classList.contains('open')) {
      this.divElementSelected.classList.remove('open');
      this.divListElements.classList.remove('open');
      
      document.removeEventListener('click', this._closeEventHandler, false);
      
      if (typeof this.objDefinitions.afterClose === 'function') {
        this.objDefinitions.afterClose(this);
      }
    }
  }
  
  setItems(items: any[]): void{
    this.divListElements.querySelectorAll('.item').forEach(i => {
      i.remove();
    });
    this._renderItemsValues();
    this._loadList(items);
  }
  
  _closeEventHandler = ({ target }) => {
    if (target.classList.contains('item') || target.classList.contains('multi-select')) { return; }
    else { this.close(); }
  }
  
  _createContainer(): void {
    this.container.classList.add('select-container');
    this.element.before(this.container);
    this.container.appendChild(this.element);
    this.element.style.display = 'none';
  }
  _html(): void {
    this._createContainer();
    this._createHiddenField();
    this._createDivElements();
    this._createListEmements();
  }
  
  _createHiddenField(): void {
    if (this.objDefinitions.target === null) {
      this.inputTarget.setAttribute('type', 'hidden');
      this.inputTarget.setAttribute('name', this.element.getAttribute('name'));
      this.element.removeAttribute('name');
      this.container.appendChild(this.inputTarget);
    }
    else { this.inputTarget = document.querySelector(this.objDefinitions.target); }
  }
  
  _createDivElements() {
    this.divElementSelected.classList.add('multi-select');
    let txtLoading = '';
    if (this.objDefinitions.loading) {
      this.divLoading.classList.add('loading');
      this.divElementSelected.appendChild(this.divLoading);
      txtLoading = this.objDefinitions.txtLoading;
    }
    let spanLabel = document.createElement('span');
    spanLabel.innerText = txtLoading || this.objDefinitions.label;
    this.divElementSelected.appendChild(spanLabel);
    this.divElementSelected.addEventListener('click', () => {
      if (this.divElementSelected.classList.contains('open')) { this.close(); }
      else { this.open(); }
    });
    this.container.appendChild(this.divElementSelected);
  }
  
  _createListEmements(): void {
    this.divListElements.classList.add('multi-select-list');
    this.container.appendChild(this.divListElements);
  }
  
  _loadList(items: any[]) {
    if (items.length > 0) {
      items.map((item) => this.createItem(item));
      if (this.objDefinitions.value.length) {
        this.setValues(this.objDefinitions.value);
        this.objDefinitions.value = [];
      }
    }
    else { this._noItems(); }
  }
  
  _noItems() {
    if (this.objDefinitions.emptyItems.length) {
      this.objDefinitions.emptyItems.map((item) => this.createItem(item, false));
    }
  }
  
  _renderItemsValues(): void {
    this.divElementSelected.innerText = '';
    if (this.selectionItems.length) {
      let maxLength = this.divElementSelected.offsetWidth - 25;
      let tagsLength = 0;
      let tagsHidden = 0;
      this.divElementSelected.removeAttribute('data-tags-hidden');
      this.divElementSelected.classList.remove('hidden-tags');
      this.selectionItems.map(o => {
        let tag: HTMLDivElement = document.createElement('div');
        tag.classList.add('tag');
        tag.innerText = o.tag.substr(0, this.objDefinitions.maxTextTag) + ((o.tag.length > this.objDefinitions.maxTextTag) ? '...' : '');
        tag.setAttribute('data-id', o.id);
        this.divElementSelected.appendChild(tag);
        tagsLength += tag.offsetWidth;
        if (tagsLength >= maxLength) {
          tag.style.display = 'none';
          tagsHidden++;
          this.divElementSelected.classList.add('hidden-tags');
          this.divElementSelected.setAttribute('data-tags-hidden', '+' + String(tagsHidden));
        }
        tag.addEventListener('click', (e) => {
          e.stopPropagation();
          this.removeItem(o.id);
          this.close();
        });
      });
    }
    else { this.divElementSelected.innerHTML = this.objDefinitions.label; }
    let itemIDs = [];
    this.selectionItems.map(o => { itemIDs.push(o.id); });
    this.inputTarget.value = itemIDs.sort().join(', ');
  }
}