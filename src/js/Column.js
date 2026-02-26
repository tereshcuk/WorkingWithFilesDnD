import Card from "./Card";

export default class Column {
  constructor(index, title, boardInstance) {
    this.index = index;
    this.title = title;
    this.cards = [];
    this.columnCard = null;
    this.board = boardInstance;
    this.formContainer = null;
    this.openFormBtn = null;
    this.columnContent = document.createElement("div");
    this.placeholder = null; // placeholder для визуализации
    this.draggedCard = null; // текущая перетаскиваемая карточка
  }

  render() {
    this.columnContent.classList.add("columnContent");

    const columnCard = document.createElement("div");
    columnCard.classList.add("column");
    columnCard.id = `${this.index}`;
    columnCard.textContent = this.title;

    this.cards.forEach((card) => {
      columnCard.append(card.render());
    });

    columnCard.addEventListener("dragover", this.handleDragOver.bind(this));
    columnCard.addEventListener("drop", this.handleDrop.bind(this));
    columnCard.addEventListener("dragleave", this.handleDragLeave.bind(this));
    columnCard.addEventListener("dragstart", this.handleDragStart.bind(this));

    const openFormBtn = document.createElement("button");
    openFormBtn.textContent = "+ Add task";
    openFormBtn.classList.add("open-button");
    openFormBtn.id = `openFormButton-${this.index}`;
    this.openFormBtn = openFormBtn;

    this.formContainer = document.createElement("div");
    this.formContainer.classList.add("form-container");

    this.openFormBtn.addEventListener("click", () => this.showForm());

    this.columnContent.append(columnCard);
    this.columnContent.append(this.openFormBtn);
    this.columnContent.append(this.formContainer);

    this.columnCard = columnCard;
    return this.columnContent;
  }

  addNewCard(text) {
    if (text && text.trim()) {
      const uniqueID = Date.now().toString();
      const card = new Card(uniqueID, text, this);
      this.addCard(card);
      this.notifyParentOfChange();
    }
  }

  notifyParentOfChange() {
    if (typeof this.board?.saveState === "function") {
      this.board.saveState();
    }
  }

  addCard(card) {
    this.cards.push(card);
    this.columnCard.append(card.render());
  }

  removeCard(cardId) {
    const index = this.cards.findIndex((card) => card.id === cardId);
    if (index > -1) {
      this.cards.splice(index, 1);
      this.columnCard.removeChild(
        document.querySelector(`[data-id="${cardId}"]`),
      );
      this.notifyParentOfChange();
    }
  }

  /**
   * Находит позицию вставки на основе координат мыши
   */
  getInsertPosition(clientY) {
    const cardElements = Array.from(
      this.columnCard.querySelectorAll(".card:not(.dragging)")
    );

    // Если нет карточек, вставляем в начало
    if (cardElements.length === 0) {
      return { index: 0, element: null };
    }

    for (let i = 0; i < cardElements.length; i++) {
      const cardElement = cardElements[i];
      const rect = cardElement.getBoundingClientRect();
      const cardMiddle = rect.top + rect.height / 2;

      // Если курсор выше середины карточки - вставляем перед ней
      if (clientY < cardMiddle) {
        return { index: i, element: cardElement };
      }
    }

    // Если дошли до конца - вставляем в конец
    return { index: cardElements.length, element: null };
  }

  /**
   * Создает или обновляет placeholder
   */
  showPlaceholder(beforeElement, height) {
    // Удаляем старый placeholder если есть
    this.removePlaceholder();

    // console.log(`showPlaceholder height: ${height}`);

    // Создаем новый
    this.placeholder = document.createElement("div");
    this.placeholder.className = "placeholder";
    this.placeholder.style.height = `${height}px`;

    // Вставляем в нужную позицию
    if (beforeElement) {
      this.columnCard.insertBefore(this.placeholder, beforeElement);
    } else {
      this.columnCard.append(this.placeholder);
    }
  }

  removePlaceholder() {
    if (this.placeholder && this.placeholder.parentNode) {
      this.placeholder.parentNode.removeChild(this.placeholder);      
      this.placeholder = null;
    }
  }

  handleDragStart(event) {

    // const sourceCardID = event.dataTransfer.getData("text/source-card-id");
    this.board.draggedCard = this.draggedCard;
    // console.log(`1 handleDragStart sourceCardID: ${sourceCardID}`);
  }

  handleDragOver(event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";    
    const sourceCardID = this.board.draggedCard.id;    

    if (!sourceCardID) return;
    
    // Получаем высоту перетаскиваемой карточки
    const draggedElement = document.querySelector(`[data-id="${sourceCardID}"]`);
    const cardHeight = draggedElement ? draggedElement.offsetHeight : 50;

    // Определяем позицию вставки
    const position = this.getInsertPosition(event.clientY);

    // Показываем placeholder
    this.showPlaceholder(position.element, cardHeight);
  }

  handleDragLeave(event) {
    // Удаляем placeholder только если покидаем колонку полностью
    // if (event.target === this.columnCard) {         
      this.removePlaceholder();
    // }
  }

  handleDrop(event) {

    event.preventDefault();
    this.removePlaceholder();

    const sourceColID = event.dataTransfer.getData("text/source-col-id");
    const sourceCardID = event.dataTransfer.getData("text/source-card-id");    

    const sourceCol = this.board.columns.find(
      (col) => col.index == sourceColID,
    );
    const sourceCard = sourceCol.cards.find((card) => card.id == sourceCardID);

    if (!sourceCard) return;    

    // Определяем финальную позицию вставки
    const position = this.getInsertPosition(event.clientY);
    const targetIndex = position.index;

    // Удаляем карточку из исходной колонки
    const elSourceCard = document.querySelector(`[data-id="${sourceCardID}"]`);
    const sourceCardIndex = sourceCol.cards.indexOf(sourceCard);

    if (sourceCardIndex >= 0) {
      sourceCol.cards.splice(sourceCardIndex, 1);
      if (elSourceCard.parentNode) {
        elSourceCard.parentNode.removeChild(elSourceCard);
      }
    }

    // Вставляем карточку в новую позицию
    this.cards.splice(targetIndex, 0, sourceCard);

    if (position.element) {
      this.columnCard.insertBefore(elSourceCard, position.element);
    } else {
      this.columnCard.append(elSourceCard);
    }

    // Обновляем родительскую колонку карточки
    sourceCard.parentColumn = this;
    this.removePlaceholder();
    this.board.draggedCard = null;

    this.notifyParentOfChange();
    if (sourceCol !== this) {
      sourceCol.notifyParentOfChange();
    }
  }

  createForm() {
    const form = document.createElement("form");
    const inputName = document.createElement("textarea");
    const labelName = document.createElement("label");
    const submitBtn = document.createElement("button");
    const closeBtn = document.createElement("button");

    inputName.id = `name_${this.index}`;
    inputName.placeholder = "Add";
    inputName.rows = "4";
    inputName.cols = "80";
    inputName.classList.add("inputName");

    labelName.textContent = "";
    labelName.setAttribute("for", `name_${this.index}`);

    submitBtn.type = "submit";
    submitBtn.textContent = "Add";

    closeBtn.textContent = "×";
    closeBtn.classList.add("close");

    form.append(labelName);
    form.append(inputName);
    form.append(submitBtn);
    form.append(closeBtn);

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      this.addNewCard(inputName.value.trim());
      inputName.value = "";
      this.hideForm();
    });

    closeBtn.addEventListener("click", (e) => {
      e.preventDefault();
      this.hideForm();
    });

    return form;
  }

  showForm() {
    if (!this.formContainer.firstChild) {
      const form = this.createForm();
      this.formContainer.append(form);
    }
    this.formContainer.style.display = "block";
    this.openFormBtn.style.display = "none";
    document.getElementById(`name_${this.index}`).focus();
  }

  hideForm() {
    this.openFormBtn.style.display = "block";
    this.formContainer.style.display = "none";
  }
}