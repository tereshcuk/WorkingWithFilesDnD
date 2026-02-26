import Column from "./Column";
import Card from "./Card";

export default class Board {
  constructor() {
    this.boardContainer = document.createElement("div");
    this.columns = [
      new Column(1, "ToDo", this),
      new Column(2, "Progress", this),
      new Column(3, "Done", this),
    ];
    this.nextCardId = 1;
    this.oldColumn = null;
    this.initUI();
    this.setupGlobalDragListeners();
    this.draggedCard = null; // текущая перетаскиваемая карточка
  }

  setupGlobalDragListeners() {
    // Добавляем класс к body при начале перетаскивания
    document.addEventListener("dragstart", (e) => {
      if (e.target.classList.contains("card")) {
        document.body.classList.add("dragging-active");
      }
    });

    // Убираем класс при окончании
    document.addEventListener("dragend", (e) => {
      if (e.target.classList.contains("card")) {
        document.body.classList.remove("dragging-active");
      }
    });

    // Удаляем слушатели при уничтожении доски
    this.destroy = () => {
      document.removeEventListener("dragstart", this.dragStartHandler);
      document.removeEventListener("dragend", this.dragEndHandler);
    };

  }

  initUI() {
    this.boardContainer.classList.add("board");
    this.boardContainer.id = "board";
    const body = document.body;
    body.append(this.boardContainer);

    const savedState = localStorage.getItem("cards")
      ? JSON.parse(localStorage.getItem("cards"))
      : {};

    this.columns.forEach((col) => {
      this.boardContainer.append(col.render());

      Object.keys(savedState).forEach((key) => {
        const data = savedState[key];
        if (data.colIndex === col.index) {
          const card = new Card(data.id, data.text, col);
          col.addCard(card);
        }
      });

      col.notifyParentOfChange = () => this.saveState();
    });
  }

  saveState() {
    const state = {};
    this.columns.forEach((col) => {
      col.cards.forEach((card) => {        
        state[card.id] = { id: card.id, text: card.text, colIndex: col.index };
      });
    });
    localStorage.setItem("cards", JSON.stringify(state));
  }
}