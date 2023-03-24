import "./css/Modal.css";
import React, { useState } from "react";
import Dates from "./Dates";
import { checkPriorityValid, isDateFormatValid, sleep } from "../utils";
import SubTask from "./SubTask";
import { deleteTodoById, getTodoByIdFromLocal } from "../ExternalServices";
import { ITodoData } from "../main/TodoList";

export function Modal(
	isOpen: boolean,
	setIsOpen,
	todo,
	setModalTodo,
	fetchTodoList,
	startNotice,
	askConfirmation
) {
	const [change, setChange] = useState(false);

	function toggleModal() {
		if (isOpen) {
			const modalOverlay: Element =
				document.getElementById("modal-overlay");
			modalOverlay.classList.add("close");
			sleep(190).then(() => {
				document.querySelector("body").classList.remove("freeze");
				setIsOpen(false);
			});
			// Using an event listener is better and more maintainable but makes the modal reappear for a split second.
		} else {
			setIsOpen(true);
		}
	}

	function dataChange(newValue, dataType: string, forceUpdate = false) {
		// General dataChange function to reload the modal and pass on new data to db

		let value = newValue;
		if (dataType === "priority") {
			if (!checkPriorityValid(newValue)) {
				startNotice("error", "Invalid Priority Entry", 2000);
				return;
			}
		} else if (
			dataType === "proposedStartDate" ||
			dataType === "proposedEndDate"
		) {
			if (!isDateFormatValid(newValue)) {
				startNotice("error", "Invalid Date", 2000);
				return;
			}
			value = new Date(value).toISOString();
		}
		if (todo[dataType] === value && !forceUpdate) return;

		todo[dataType] = value;
		todo.lastUpdated = new Date().toISOString();
		// Here we should place a call to external services to update db
		fetchTodoList();
		if (!forceUpdate) {
			startNotice("success", "Data Updated");
		}
		setChange(!change);
	}

	function deleteTodo() {
		function next() {
			// Deletes reference to this todo for the parent task.
			if (todo.parentTask) {
				const parent: ITodoData = getTodoByIdFromLocal(todo.parentTask);
				for (const subtask of parent.subTasks) {
					if (subtask.link && subtask.id === todo.id) {
						subtask.name = todo.title;
						subtask.link = false;
						subtask.id = "";
					}
				}
			}
			// Deletes linked subtasks
			for (const subtask of todo.subTasks) {
				if (subtask.link) {
					fetchTodoList(); // Error if this is gone.
					deleteTodoById(subtask.id);
				}
			}
			deleteTodoById(todo.id).then(() => {
				fetchTodoList();
			});
			startNotice("success", "Deleting Todo");
			toggleModal();
		}

		askConfirmation(
			`Are you sure you want to permanently delete "${todo.title}" and all linked subtasks?`,
			next
		);
	}

	function overlayClicked(event) {
		if (event.target.id === "modal-overlay") toggleModal();
	}

	function changeStatus(new_status: string) {
		if (new_status === "incomplete") {
			todo.actualStartDate = "";
			todo.actualEndDate = "";
		} else todo[buttonTextOpts[new_status][2]] = new Date().toISOString();

		dataChange(new_status, "status");
	}

	// Button text depending on status
	const buttonTextOpts = {
		incomplete: ["Start!", "in-progress", ""],
		"in-progress": ["Finish!", "complete", "actualStartDate"],
		complete: ["Restart?", "incomplete", "actualEndDate"]
	};

	if (!isOpen) return;
	document.querySelector("body").classList.add("freeze");
	return (
		<div id="modal-overlay" onClick={overlayClicked}>
			<div id="modal">
				<input
					type="text"
					defaultValue={todo.title}
					onBlur={(event) => {
						dataChange(event.target.value, "title");
					}}
					className="title"
				/>
				<img
					src={process.env.PUBLIC_URL + "/assets/close_x.svg"}
					alt="Close modal"
					onClick={toggleModal}
					id="close-modal"
				/>
				<img
					src={process.env.PUBLIC_URL + "/assets/trash.svg"}
					alt="Delete current todo"
					onClick={deleteTodo}
					id="delete-todo"
				/>
				<p className="type">
					<input
						type="text"
						defaultValue={todo.type}
						onBlur={(event) => {
							dataChange(event.target.value, "type");
						}}
					/>
				</p>
				<p className="priority">
					Priority:{" "}
					<input
						type="text"
						defaultValue={todo.priority}
						onBlur={(event) => {
							dataChange(event.target.value, "priority");
						}}
					/>
				</p>
				<Dates todo={todo} dataChange={dataChange} />
				{todo.subTasks.length ? (
					<h3>Subtasks:</h3>
				) : (
					<span className="space"></span>
				)}
				<ul id="subtasks">
					{todo.subTasks.map((subtask) => (
						<SubTask
							subtask={subtask}
							setModalTodo={setModalTodo}
							dataChange={dataChange}
							startNotice={startNotice}
						/>
					))}
				</ul>
				<h3>Description:</h3>
				<textarea
					defaultValue={todo.description}
					onBlur={(event) => {
						dataChange(event.target.value, "description");
					}}
					id="description"
				></textarea>
				<button
					onClick={() => {
						changeStatus(buttonTextOpts[todo.status][1]);
					}}
					id="progress"
				>
					{buttonTextOpts[todo.status][0]}
				</button>
			</div>
		</div>
	);
}
