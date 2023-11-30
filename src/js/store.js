import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { request, wait, withoutNullish } from "./util.js";
import { prettyprint } from "./util.js";

const searchNumberSlice = (set) => ({
  searchNumber: {
    value: null,
    valid: false,
    setOkValue: (value) =>
      set(({ searchNumber }) => {
        searchNumber.value = value;
        const parsed = parseInt(value, 10);
        searchNumber.valid =
          !Number.isNaN(parsed) && Number.isInteger(parsed) && parsed > 0;
      }),
    setBadValue: (value) =>
      set(({ searchNumber }) => {
        searchNumber.value = value;
        searchNumber.valid = false;
      }),
    setEmpty: () =>
      set(({ searchNumber }) => {
        searchNumber.value = null;
      }),
  },
});

const searchDueDateSlice = (set) => ({
  searchDueDate: {
    value: null,
    mode: "older", // "older" | "later" | "exact"

    setValue: (value) =>
      set(({ searchDueDate }) => {
        searchDueDate.value = value;
      }),
    setEmpty: () =>
      set(({ searchDueDate }) => {
        searchDueDate.value = null;
      }),
    setMode: (value) =>
      set(({ searchDueDate }) => {
        searchDueDate.mode = value;
      }),
  },
});

const searchContentSlice = (set) => ({
  searchContent: {
    value: null,
    mode: "contain", // "contain" | "exact"

    setValue: (value) =>
      set(({ searchContent }) => {
        searchContent.value = value;
      }),
    setEmpty: () =>
      set(({ searchContent }) => {
        searchContent.value = null;
      }),
    setMode: (value) =>
      set(({ searchContent }) => {
        searchContent.mode = value;
      }),
  },
});

const includeDoneSlice = (set) => ({
  searchDone: {
    value: "notDone", // "notDone" | "done" | "both"
    setValue: (value) =>
      set(({ searchDone }) => {
        searchDone.value = value;
      }),
  },
});

const tasksSlice = (set, get) => ({
  tasks: {
    tasks: [],
    loading: false,

    toggleDone: async (id) => {
      const task = get().tasks.tasks.find((x) => x.id === id);
      if (task == null) {
        throw new Error(`requested task does not exist (id:${id})`);
      }

      await wait(3000);

      const res = await request("PUT", "/api/tasks/index.php", {
        id: task.id,
        content: task.content,
        dueDate: task.dueDate,
        done: !task.done,
      });
      if (res.ok !== true) {
        throw new Error(`request failed?: ${res}`);
      }

      set(({ tasks }) => {
        tasks.tasks.find((x) => x.id === id).done = !task.done;
      });
    },

    load: () => {
      set(({ tasks }) => {
        tasks.loading = true;
      });

      const state = get();

      const origin = {
        searchNumber: state.searchNumber.value,
        searchDueDate: state.searchDueDate.value,
        searchDuaDateMode: state.searchDueDate.mode,
        searchContent: state.searchContent.value,
        searchContentMode: state.searchContent.mode,
        done: state.searchDone.value,
      };

      const params = new URLSearchParams(withoutNullish(origin));

      wait(500)
        .then(() => fetch("/api/tasks/index.php?" + params))
        .then((x) => x.json())
        .then((res) => {
          set(({ tasks }) => {
            tasks.loading = false;
            tasks.tasks = res.tasks;
          });
        });
    },
  },
});

const createTaskModalSlice = (set, get) => ({
  createTaskModal: {
    shown: false,
    posting: false,

    forID: null,
    done: false,

    validationShown: false,

    content: "",
    dueDate: "",

    reset: () =>
      set(({ createTaskModal }) => {
        createTaskModal.forID = null;
        createTaskModal.content = "";
        createTaskModal.dueDate = "";
        createTaskModal.validationShown = false;
      }),

    openForEdit: (taskID) =>
      set(({ tasks, createTaskModal }) => {
        const task = tasks.tasks.find((x) => x.id === taskID);
        if (task == null) {
          const s = `openForEdit is called on unknown task (id: ${taskID})`;
          throw new Error(s);
        }
        createTaskModal.forID = task.id;
        createTaskModal.content = task.content;
        createTaskModal.dueDate = task.dueDate;
        createTaskModal.done = task.done;
        createTaskModal.shown = true;
      }),

    handleOpen: () =>
      set(({ createTaskModal }) => {
        createTaskModal.reset();
        createTaskModal.shown = true;
      }),

    handleClose: () =>
      set(({ createTaskModal }) => {
        createTaskModal.reset();
        createTaskModal.shown = false;
      }),

    setPosting: (value) =>
      set(({ createTaskModal }) => {
        createTaskModal.posting = value;
      }),

    showValidation: () =>
      set(({ createTaskModal }) => {
        createTaskModal.validationShown = true;
      }),

    setContent: (value) =>
      set(({ createTaskModal }) => {
        createTaskModal.content = value;
      }),

    setDueDate: (value) =>
      set(({ createTaskModal }) => {
        createTaskModal.dueDate = value;
      }),

    handleSubmit: (valid) => {
      const me = get();

      me.createTaskModal.showValidation();

      if (!valid) {
        return;
      }

      me.createTaskModal.setPosting(true);

      (async () => {
        await wait(500);

        let res;
        if (me.createTaskModal.forID == null) {
          res = await request("POST", "/api/tasks/index.php", {
            content: me.createTaskModal.content,
            dueDate: me.createTaskModal.dueDate,
          });
        } else {
          res = await request("PUT", "/api/tasks/index.php", {
            id: me.createTaskModal.forID,
            content: me.createTaskModal.content,
            dueDate: me.createTaskModal.dueDate,
            done: me.createTaskModal.done,
          });
        }

        if (res.ok !== true) {
          throw new Error(`submit failed? ${prettyprint(res)}`);
        }

        me.tasks.load();
        me.createTaskModal.handleClose();
      })().finally(() => me.createTaskModal.setPosting(false));
    },
  },
});

const deleteConfirmModalSlice = (set, get) => ({
  deleteConfirmModal: {
    shown: false,
    processing: false,
    taskID: -1,

    setProcessing: (value) =>
      set(({ deleteConfirmModal }) => {
        deleteConfirmModal.processing = value;
      }),

    show: (taskID) =>
      set(({ deleteConfirmModal }) => {
        deleteConfirmModal.taskID = taskID;
        deleteConfirmModal.shown = true;
      }),

    handleClose: () =>
      set(({ deleteConfirmModal }) => {
        deleteConfirmModal.shown = false;
        deleteConfirmModal.processing = false;
        deleteConfirmModal.taskID = -1;
      }),

    handleDelete: () => {
      const state = get();
      state.deleteConfirmModal.setProcessing(true);

      (async () => {
        const res = await request("DELETE", "/api/tasks/index.php", {
          id: get().deleteConfirmModal.taskID,
        });
        if (res.ok !== true) {
          throw new Error(`submit failed? ${prettyprint(res)}`);
        }

        state.tasks.load();
        state.deleteConfirmModal.handleClose();
      })().finally(() => state.deleteConfirmModal.setProcessing(false));
    },
  },
});

export const useStore = create(
  immer((...a) => ({
    ...searchNumberSlice(...a),
    ...searchContentSlice(...a),
    ...searchDueDateSlice(...a),
    ...tasksSlice(...a),
    ...includeDoneSlice(...a),
    ...createTaskModalSlice(...a),
    ...deleteConfirmModalSlice(...a),
  }))
);
