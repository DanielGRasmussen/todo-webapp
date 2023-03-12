import React, { useState } from "react";
import Select, { components } from "react-select";

function SortButton({ onClick }): JSX.Element {
	const [isDescending, setIsDescending] = useState(true);
	const [first, isFirst] = useState(true);

	// down arrow = descending = z to a
	const handleOnClick = (): void => {
		setIsDescending(!isDescending);
		isFirst(false);
		onClick(isDescending);
	};

	let sortBy: string;
	if (isDescending) {
		sortBy = "Ascending";
	} else {
		sortBy = "Descending";
	}

	// Swap between rotating it upside-down and downside-up
	const arrowStyle: { animation: string } = {
		animation: isDescending
			? "downside-up 0.3s linear forwards"
			: "upside-down 0.3s linear forwards"
	};
	// Since it requires the same type.
	const blankStyle: { animation: string } = { animation: "" };

	return (
		<div onClick={handleOnClick} id="sort-direction">
			{isDescending ? (
				<img
					src={
						process.env.PUBLIC_URL + first
							? "/assets/up_arrow.svg"
							: "/assets/down_arrow.svg"
					}
					alt="Ascending order"
					style={first ? blankStyle : arrowStyle}
					title={sortBy}
				/>
			) : (
				<img
					src={process.env.PUBLIC_URL + "/assets/up_arrow.svg"}
					alt="Descending order"
					style={arrowStyle}
					title={sortBy}
				/>
			)}
		</div>
	);
}

function SearchMenu(
	searchQuery: string,
	setSearchQuery,
	sortingOptions: { value: string; label: string }[],
	selectedSortingOption: { value: string; label: string },
	setSelectedSortingOption,
	handleSortOrderChange
): JSX.Element {
	const [isMenuOpen, setIsMenuOpen] = useState(true);

	const openMenuHandler = async () => {
		await setIsMenuOpen(true);
	};

	const closeMenuHandler = () => {
		const menu = document.querySelector(`#menu .react-select-menu`);
		menu.classList.add("react-select-menu-close");

		setTimeout(() => {
			setIsMenuOpen(false);
		}, 300);
	};

	const selectStyles = {
		control: (provided, state) => ({
			...provided,
			background: "#fff",
			borderColor: "#9e9e9e",
			minHeight: "50px",
			height: "50px",
			boxShadow: state.isFocused ? null : null,
			width: "370px",
			cursor: "pointer"
		}),
		valueContainer: (provided) => ({
			...provided,
			height: "30px",
			padding: "0 6px",
			marginBottom: "17px"
		}),
		input: (provided) => ({
			...provided,
			margin: "0px"
		}),
		indicatorSeparator: () => ({
			display: "none"
		}),
		indicatorsContainer: (provided) => ({
			...provided,
			height: "40px",
			marginBottom: "15px"
		}),
		menu: (provided) => ({
			...provided,
			marginTop: "-5px",
			width: "370px"
		})
	};

	return (
		<form id="menu">
			<input
				type="text"
				value={searchQuery}
				onChange={(event) => setSearchQuery(event.target.value)}
				placeholder="Search..."
			/>
			<Select
				className="custom-select"
				options={sortingOptions}
				value={selectedSortingOption}
				onChange={(option) => setSelectedSortingOption(option)}
				styles={selectStyles}
				components={{
					Menu: (props) => (
						<components.Menu
							{...props}
							children=""
							className="react-select-menu"
						/>
					)
				}}
				menuIsOpen={isMenuOpen}
				onMenuOpen={openMenuHandler}
				onMenuClose={closeMenuHandler}
			/>
			<SortButton onClick={handleSortOrderChange} />
		</form>
	);
}

export default SearchMenu;
