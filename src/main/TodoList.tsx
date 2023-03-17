import "./css/TodoList.css";
import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import { getToDoList } from "../ExternalServices";
import SearchMenu from "./SearchMenu";

export interface ITodoData {
	id: string;
	created: string;
	proposedStartDate: string;
	actualStartDate: string;
	proposedEndDate: string;
	actualEndDate: string;
	title: string;
	description: string;
	type: string;
	subTasks: string[];
	priority: string;
	status: string;
	lastUpdated: string;
}

interface TodoElementProps {
	todo: ITodoData;
}

function TodoElement({ todo }: TodoElementProps): JSX.Element {
	// Convert ISO to date
	function formatDate(ISOstring: string): string {
		return new Date(ISOstring).toLocaleString("en-US", {
			month: "numeric",
			day: "numeric",
			year: "numeric",
			hour: "numeric",
			minute: "numeric",
			hour12: true
		});
	}

	const behindStart: boolean =
		todo.status === "incomplete" &&
		!todo.actualStartDate &&
		new Date() > new Date(todo.proposedStartDate);
	const behindFinish: boolean =
		todo.status === "in-progress" &&
		!todo.actualEndDate &&
		new Date() > new Date(todo.proposedEndDate);

	return (
		<li
			className={`todo-item ${todo.status} ${todo.type} ${
				behindStart || behindFinish ? "behind" : ""
			}`}
		>
			<h3>{todo.title}</h3>
			<p className="type">{todo.type}</p>
			<p className="priority">Priority: {todo.priority}</p>
			<p className="date">
				{todo.actualStartDate
					? `Start date: ${formatDate(todo.actualStartDate)}`
					: `Planned Start: ${formatDate(todo.proposedStartDate)}`}
			</p>
			<p className="date">
				Completion date:{" "}
				{formatDate(
					todo.actualEndDate
						? todo.actualEndDate
						: todo.proposedEndDate
				)}
			</p>
			<p className="description">{todo.description}</p>
		</li>
	);
}

function TodoList(): JSX.Element {
	// Gives the to-do list with sorting options
	const sortingOptions: { value: string; label: string }[] = [
		{ value: "title", label: "Title" },
		{ value: "priority", label: "Priority" },
		{ value: "status", label: "Status" },
		{ value: "type", label: "Type" },
		{ value: "created", label: "Creation date" },
		{ value: "proposedStartDate", label: "Planned start date" },
		{ value: "actualStartDate", label: "Start date" },
		{ value: "proposedEndDate", label: "Planned end date" },
		{ value: "actualEndDate", label: "End date" },
		{ value: "lastUpdated", label: "Last updated" }
	];

	// Create the elements for the search and functions to update them
	const [todoList, setTodoList] = useState<ITodoData[]>([]);
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedSortingOption, setSelectedSortingOption]: [
		{ value: string; label: string }[],
		Dispatch<SetStateAction<{ value: string; label: string }[]>>
	] = useState([sortingOptions[0]]);
	const [sortOrder, setSortOrder] = useState(false);
	const [filters, setFilters] = useState([]);

	// Gets the unique types from todoList
	const filterOptions = Array.from(
		new Set(
			todoList.map((todo: ITodoData) => ({
				value: todo.type.toLowerCase(),
				label: todo.type.toLowerCase()
			}))
		)
	);

	useEffect(() => {
		const fetchTodoList = async () => {
			const fetchedList: ITodoData[] = await getToDoList();
			setTodoList(fetchedList);
		};
		fetchTodoList();
	}, []);

	// Search query is in it, and it's type is in filters (if there are any)
	const filteredTodoList: ITodoData[] = todoList.filter(
		(todo) =>
			todo.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
			(filters.length === 0 ||
				filters.some(
					(option) => option.value === todo.type.toLowerCase()
				))
	);

	const sortedTodoList: ITodoData[] = filteredTodoList.sort((a, b) => {
		let result = 0;
		for (let i = 0; i < selectedSortingOption.length; i++) {
			const aValue: string = a[selectedSortingOption[i].value];
			const bValue: string = b[selectedSortingOption[i].value];
			if (aValue < bValue) {
				result = -1;
				break;
			}
			if (aValue > bValue) {
				result = 1;
				break;
			}
		}
		return result;
	});

	if (sortOrder) {
		sortedTodoList.reverse();
	}

	return (
		<div>
			{SearchMenu(
				searchQuery,
				setSearchQuery,
				sortingOptions,
				selectedSortingOption,
				setSelectedSortingOption,
				setSortOrder,
				filterOptions,
				filters,
				setFilters
			)}
			<ul id="todos">
				{sortedTodoList.map((todo) => (
					<TodoElement key={todo.id} todo={todo} />
				))}
			</ul>
		</div>
	);
}

export default TodoList;
