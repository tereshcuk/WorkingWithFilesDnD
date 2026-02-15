import Card from "./Card";

export default class Column {
  constructor(index, title, boardInstance) {
    this.index = index;
    this.title = title;
    this.cards = []; // массив карточек
    this.columnCard = null;
    this.board = boardInstance; // ссылка на родительную доску
    this.formContainer = null;
    this.openFormBtn = null;
    this.columnContent = document.createElement("div");
    // this.render();
  }

  render() {
    this.columnContent.classList.add("columnContent");

    const columnCard = document.createElement("div");
    columnCard.classList.add("column");
    columnCard.id = `${this.index}`;
    columnCard.textContent = this.title;

    // Добавляем существующие карточки
    this.cards.forEach((card) => {
      columnCard.append(card.render());
    });

    // Обрабатываем событие drag-over и drop
    columnCard.addEventListener("dragover", this.handleDragOver.bind(this));
    columnCard.addEventListener("drop", this.handleDrop.bind(this));
    columnCard.addEventListener(
      "dragstart",
      this.handleStartDragging.bind(this),
    );
    columnCard.addEventListener("dragend", this.handleEndDragging.bind(this));

    const openFormBtn = document.createElement("button");
    openFormBtn.textContent = "+ Add task";
    openFormBtn.classList.add("open-button");
    openFormBtn.id = `openFormButton-${this.index}`;
    this.openFormBtn = openFormBtn;

    this.formContainer = document.createElement("div");
    this.formContainer.classList.add("form-container");

    // Подписываемся на событие нажатия кнопки открытия формы
    this.openFormBtn.addEventListener("click", () => this.showForm());

    this.columnContent.append(columnCard);
    this.columnContent.append(this.openFormBtn);
    this.columnContent.append(this.formContainer);

    this.columnCard = columnCard;
    return this.columnContent;
  }

  /**
   * Добавляет новую карточку в конец списка
   */
  addNewCard(text) {
    if (text && text.trim()) {
      // Генерируем уникальное ID для карточки
      const uniqueID = Date.now().toString(); // Или можно использовать global counter
      const card = new Card(uniqueID, text, this);
      this.addCard(card);
      this.notifyParentOfChange();
    }
  }

  /**
   * Оповещает родительскую доску о внесении изменений
   */
  notifyParentOfChange() {
    if (typeof this.board?.saveState === "function") {
      this.board.saveState();
    }
  }

  /**
   * Добавляет карточку в данную колонку
   */
  addCard(card) {
    this.cards.push(card);
    this.columnCard.append(card.render());
  }

  /**
   * Удаляет карточку по её ID
   */
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

  handleStartDragging(event) {
    event.dataTransfer.setData("text/source-col-id", this.index);
    event.target.style.cursor = "grabbing"; // Активируем закрытый хват
  }

  /**
   * Обрабатывает событие drag over
   */
  handleDragOver(event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }

  /**
   * Обрабатывает событие drop
   */
  handleDrop(event) {
    event.preventDefault();

    const sourceColID = event.dataTransfer.getData("text/source-col-id");
    const sourceCardID = event.dataTransfer.getData("text/source-card-id");

    const sourceСol = this.board.columns.find(
      (col) => col.index == sourceColID,
    );
    const sourceCard = sourceСol.cards.find((card) => card.id == sourceCardID);

    // Определить координату относительной высоты относительно колонки
    const newPositionRatio = event.offsetY / this.columnCard.clientHeight;
    const targetIndex = Math.min(
      Math.floor(newPositionRatio * this.cards.length),
      this.cards.length,
    );

    // Удаляем старую карточку из DOM и массива
    const elSourceCard = document.querySelector(`[data-id="${sourceCardID}"]`);
    const sourceCardIndex = sourceСol.cards.indexOf(sourceCard);
    if (sourceCardIndex >= 0) {
      sourceСol.cards.splice(sourceCardIndex, 1);
      sourceСol.columnCard.removeChild(elSourceCard);
    }

    // Вставляем карточку в новую позицию
    this.cards.splice(targetIndex, 0, sourceCard);
    this.columnCard.insertBefore(
      elSourceCard,
      this.columnCard.children[targetIndex],
    );

    // Уведомляем родительскую доску о необходимости обновления
    this.notifyParentOfChange();
  }

  handleEndDragging(event) {
    event.target.style.cursor = "grab";
  }

  createPlaceholder(height) {
    const placeholder = document.createElement("div");
    placeholder.className = "placeholder";
    placeholder.style.height = `${height}px`;
    return placeholder;
  }

  // Функция для создания формы
  createForm() {
    // Создаем элементы формы
    const form = document.createElement("form");
    const inputName = document.createElement("textarea");
    const labelName = document.createElement("label");
    const submitBtn = document.createElement("button");
    const closeBtn = document.createElement("button");

    // Настраиваем элементы
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

    // Собираем структуру формы
    form.append(labelName);
    form.append(inputName);
    form.append(submitBtn);
    form.append(closeBtn);

    submitBtn.addEventListener("click", () =>
      this.addNewCard(inputName.value.trim()),
    );
    closeBtn.addEventListener("click", () => {
      this.formContainer.style.display = "none";
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

  // Обработчик события закрытия формы
  hideForm() {
    //preventDefault();
    this.openFormBtn.style.display = "block";
    this.formContainer.style.display = "none";
  }
}
