import { useShallow } from "zustand/react/shallow";
import { html } from "htm/preact";
import {
  Button,
  FloatingLabel,
  Form,
  Dropdown,
  DropdownButton,
  InputGroup,
} from "react-bootstrap";

import { useStore } from "./store.js";

export function SearchNumberInput() {
  const store = useStore(useShallow(({ searchNumber }) => searchNumber));

  const onChange = (e) => {
    const valid = e.target.checkValidity();
    const emptyInput = e.target.value == "";
    if (!valid) {
      store.setBadValue(e.target.value);
      return;
    }
    if (emptyInput) {
      store.setEmpty();
      return;
    }
    store.setOkValue(e.target.value);
  };

  const isDefined = store.value != null;

  return html`
    <${InputGroup} className="mb-3">
      <${InputGroup.Text}>#<//>
      <${FloatingLabel} label="No">
        <${Form.Control}
          type="number"
          placeholder="No"
          isValid=${isDefined && store.valid}
          isInvalid=${isDefined && !store.valid}
          value=${store.value ?? ""}
          onChange=${onChange}
        />
      <//>
      <${Button} variant="outline-secondary" onClick=${() => store.setEmpty()}>
        X
      <//>
    <//>
  `;
}

export function SearchDueDateInput() {
  const store = useStore(useShallow(({ searchDueDate }) => searchDueDate));

  const sMode = (() => {
    switch (store.mode) {
      case "older":
        return "より前";
      case "later":
        return "より後";
      case "exact":
        return "に一致";
      default:
        throw new Error(`unknown mode: ${store.mode}`);
    }
  })();

  return html`
    <${InputGroup} className="mb-3">
      <${FloatingLabel} label="期限">
        <${Form.Control}
          type="date"
          placeholder="期限"
          value=${store.value ?? ""}
          isValid=${store.value != null}
          onChange=${(e) => store.setValue(e.target.value)}
        />
      <//>

      <${DropdownButton} title=${sMode} variant="outline-secondary">
        <${Dropdown.Item} onClick=${() => store.setMode("older")} href="#">
          より前
        <//>
        <${Dropdown.Item} onClick=${() => store.setMode("later")} href="#">
          より後
        <//>
        <${Dropdown.Item} onClick=${() => store.setMode("exact")} href="#">
          に一致
        <//>
      <//>

      <${Button} variant="outline-secondary" onClick=${() => store.setEmpty()}>
        X
      <//>
    <//>
  `;
}

export function SearchContentInput() {
  const store = useStore(useShallow(({ searchContent }) => searchContent));

  const sMode = (() => {
    switch (store.mode) {
      case "contain":
        return "を含む";
      case "exact":
        return "に一致";
      default:
        throw new Error(`unknown mode: ${store.mode}`);
    }
  })();

  return html`
    <${InputGroup} className="mb-3">
      <${FloatingLabel} label="事柄">
        <${Form.Control}
          type="text"
          placeholder="事柄"
          value=${store.value == null ? "" : store.value}
          isValid=${store.value != null}
          onChange=${(e) => store.setValue(e.target.value)}
        />
      <//>

      <${DropdownButton} title=${sMode} variant="outline-secondary">
        <${Dropdown.Item} onClick=${() => store.setMode("contain")} href="#">
          を含む
        <//>
        <${Dropdown.Item} onClick=${() => store.setMode("exact")} href="#">
          に一致
        <//>
      <//>

      <${Button} variant="outline-secondary" onClick=${() => store.setEmpty()}>
        X
      <//>
    <//>
  `;
}

export function SearchDoneInput() {
  const store = useStore(useShallow(({ searchDone }) => searchDone));

  const sMode = (x) => {
    switch (x) {
      case "both":
        return "完了状態を問わない";
      case "done":
        return "完了済みのみ";
      case "notDone":
        return "未完了のみ";
      default:
        throw new Error(`unknown value: ${x}`);
    }
  };

  return html`
    <${FloatingLabel} className="mb-3" label="タスク種別">
      <${Form.Select}
        value=${store.value}
        onChange=${(e) => store.setValue(e.target.value)}
      >
        ${["both", "done", "notDone"].map(
          (x) => html`<option value=${x}>${sMode(x)}</option>`
        )}
      <//>
    <//>
  `;
}
