import "preact/debug";
import { render } from "preact";
import { useEffect, useState } from "preact/hooks";
import { html } from "htm/preact";
import {
  Accordion,
  Button,
  Spinner,
  Modal,
  Table,
  Form,
} from "react-bootstrap";
import { useShallow } from "zustand/react/shallow";

import {
  SearchNumberInput,
  SearchContentInput,
  SearchDueDateInput,
  SearchDoneInput,
} from "./search.js";
import { useStore } from "./store.js";
import { EditIcon, TrashIcon } from "./icons.js";
import { humanDate } from "./util.js";

function App() {
  const load = useStore((x) => x.tasks.load);

  useEffect(() => {
    load();
  }, []);

  return html`
    <div class="container mt-2">
      <${NotDoneTasks} />
    </div>
  `;
}

function NotDoneTasks() {
  return html`
    <div>
      <h2>タスク一覧</h2>
      <${ControlLine} />
      <${TaskTable} />
      <${DeleteConfirmModal} />
    </div>
  `;
}

function CreateTaskSection() {
  const state = useStore(useShallow(({ createTaskModal }) => createTaskModal));

  const {
    shown,
    forID,
    posting,
    validationShown,
    handleOpen,
    handleClose,
    content,
    setContent,
    dueDate,
    setDueDate,
  } = state;

  const handleSubmit = (event) => {
    event.preventDefault();
    event.stopPropagation();
    state.handleSubmit(event.target.checkValidity());
  };

  return html`
    <div class="mb-2">
      <${Button} variant="success" onClick=${handleOpen}>追加<//>
    </div>

    <${Modal} show=${shown} onHide=${handleClose} onSubmit=${handleSubmit}>
      <${Modal.Header} closeButton>
        <${Modal.Title}>
          ${forID == null ? "タスク追加" : `タスク No.${forID} の編集`}
        <//>
      <//>
      <${Form} noValidate validated=${validationShown}>
        <${Modal.Body}>
          <${Form.Group} class="mb-2 position-relative">
            <${Form.Label}>事柄<//>
            <${Form.Control}
              required
              type="text"
              placeholder="事柄"
              pattern=".*\\S+.*"
              value=${content}
              onChange=${(e) => setContent(e.target.value)}
            />
            <${Form.Control.Feedback} type="invalid" tooltip>
              入力してください
            <//>
          <//>

          <${Form.Group}>
            <${Form.Label}>期日<//>
            <${Form.Control}
              required
              type="date"
              placeholder="期日"
              min=${new Date().toISOString().substring(0, 10)}
              value=${dueDate}
              onChange=${(e) => setDueDate(e.target.value)}
            />
            <${Form.Control.Feedback} type="invalid" tooltip>
              未来の日付を入力してください
            <//>
          <//>
        <//>

        <${Modal.Footer}>
          <${Button} type="submit" variant="success" disabled=${posting}>
            ${posting ? html`<${Spinner} />` : forID == null ? "追加" : "更新"}
          <//>
        <//>
      <//>
    <//>
  `;
}

function DeleteConfirmModal() {
  const state = useStore(
    useShallow(({ deleteConfirmModal }) => deleteConfirmModal)
  );

  const { shown, processing, taskID, handleClose } = state;

  const handleSubmit = (event) => {
    event.preventDefault();
    event.stopPropagation();
    state.handleDelete();
  };

  return html`
    <${Modal} show=${shown} onHide=${handleClose}>
      <${Modal.Header} closeButton>
        <${Modal.Title}>タスク削除確認<//>
      <//>
      <${Modal.Body}> タスク No.${taskID} を本当に削除しますか? <//>

      <${Modal.Footer}>
        <${Button}
          type="submit"
          variant="danger"
          disabled=${processing}
          onClick=${handleSubmit}
        >
          ${processing ? html`<${Spinner} />` : "削除"}
        <//>
        <${Button}
          type="button"
          variant="outline-primary"
          disabled=${processing}
          onClick=${handleClose}
        >
          キャンセル
        <//>
      <//>
    <//>
  `;
}

function ControlLine() {
  const load = useStore((x) => x.tasks.load);

  return html`
    <${CreateTaskSection} />
    <${Accordion}>
      <${Accordion.Item} eventKey="0">
        <${Accordion.Header}>検索<//>
        <${Accordion.Body}>
          <${SearchNumberInput} />
          <${SearchDueDateInput} />
          <${SearchContentInput} />
          <${SearchDoneInput} />

          <div>
            <${Button}
              className="me-2"
              variant="outline-primary"
              onClick=${() => load()}
            >
              検索
            <//>
          </div>
        <//>
      <//>
    <//>
  `;
}

function TaskRow(props) {
  const [processing, setProcessing] = useState(false);

  const toggleDone = useStore((x) => x.tasks.toggleDone);
  const showDeleteModal = useStore((x) => x.deleteConfirmModal.show);
  const showEditModal = useStore((x) => x.createTaskModal.openForEdit);

  const diff = Math.round(
    (new Date(props.due) - new Date()) / (1000 * 60 * 60 * 24)
  );

  const onClick = () => {
    setProcessing(true);
    toggleDone(props.number).finally(() => setProcessing(false));
  };

  const control = (() => {
    if (processing) {
      return html`<${Spinner} />`;
    }
    if (!props.done) {
      return html`<${Button} variant="outline-primary" onClick=${onClick}>
        完了にする
      <//>`;
    }
    return html`<${Button} variant="outline-danger" onClick=${onClick}>
      未完了に戻す
    <//>`;
  })();

  const onTrash = () => {
    showDeleteModal(props.number);
  };
  const onEdit = () => {
    showEditModal(props.number);
  };

  return html`
    <tr>
      <th class="align-middle" scope="row">${props.number}</th>
      <td class="align-middle">${props.content}</td>
      <td class=${"align-middle" + (diff > 0 ? "" : " text-danger")}>
        ${humanDate(new Date(props.due))}
      </td>
      <td>${control}</td>
      <td>
        <span class="me-2" onClick=${onTrash}><${TrashIcon} /></span>
        <span onClick=${onEdit}><${EditIcon} /></span>
      </td>
    </tr>
  `;
}

function LoadingRow() {
  return html`
    <tr>
      <td colspan="4" class="text-center">
        <${Spinner} />
      </td>
    </tr>
  `;
}

function TaskTable() {
  const tasks = useStore(useShallow(({ tasks }) => tasks));

  const body = (() => {
    if (tasks.loading) {
      return html`<${LoadingRow} />`;
    }

    return tasks.tasks.map(
      (t) => html`
        <${TaskRow}
          number=${t.id}
          content=${t.content}
          due=${t.dueDate}
          done=${t.done}
          key=${t.id}
        />
      `
    );
  })();

  return html`
    <${Table}>
      <thead>
        <tr>
          <th scope="col">#</th>
          <th scope="col">事柄</th>
          <th scope="col">期限</th>
          <th scope="col">操作</th>
          <th scope="col"></th>
        </tr>
      </thead>
      <tbody>
        ${body}
      </tbody>
    <//>
  `;
}

render(html`<${App} />`, document.body);
