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
  }

  initUI() {
    this.boardContainer.classList.add("board");
    this.boardContainer.id = "board";
    const body = document.body;
    body.append(this.boardContainer);

    // Получаем данные из localStorage
    const savedState = localStorage.getItem("cards")
      ? JSON.parse(localStorage.getItem("cards"))
      : {};

    // Рендерим колонки и подгружаем ранее созданные карточки
    this.columns.forEach((col) => {
      this.boardContainer.append(col.render());

      // Подгружаем старые карточки из localStorage
      Object.keys(savedState).forEach((key) => {
        const data = savedState[key];
        if (data.colIndex === col.index) {
          const card = new Card(data.id, data.text, col);
          col.addCard(card);
        }
      });
      // Регистрация callback для уведомлений о переменах
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
