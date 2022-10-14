import React from 'react';
import { useReducer } from 'react';
import DigitButton from './DigitButton';
import OperationButton from './OperationButton';
import './styles.css';

export const ACTIONS = {
	ADD_DIGIT: 'add-digit',
	CHOOSE_OPERATION: 'choose-operation',
	CLEAR: 'clear',
	DELETE_DIGIT: 'delete-digit',
	EVALUATE: 'evaluate',
};

export default function App() {
	// break the action parameter into type and payload
	function reducer(state, { type, payload }) {
		switch (type) {
			case ACTIONS.ADD_DIGIT:
				//after doing a calculation, to overwrite the answer
				if (state.overwrite === true) {
					return {
						...state,
						currentOperand: payload.digit,
						overwrite: false,
					};
				}

				//not to add more than a 0 at the beginning
				if (payload.digit === '0' && state.currentOperand === '0')
					return state;

				//not to add more than a "." in the same state
				if (payload.digit === '.' && state.currentOperand.includes('.'))
					return state;

				return {
					...state,
					currentOperand: `${state.currentOperand || ''}${
						payload.digit
					}`,
				};

			case ACTIONS.CHOOSE_OPERATION:
				// if there's none value, return just my state
				if (
					state.currentOperand == null &&
					state.previousOperand == null
				) {
					return state;
				}

				// to replace the operator on previous operator if I typed wrong operator, ex: 74+, and I want 74-, this is to change the operator + to - without lose the state
				if (state.currentOperand == null) {
					return {
						...state,
						operation: payload.operation,
					};
				}

				// to make my current operation go to the top as previous state.
				if (state.previousOperand == null) {
					return {
						...state,
						operation: payload.operation,
						previousOperand: state.currentOperand,
						currentOperand: null,
					};
				}

				// to really make the operation, evaluate/calculate
				return {
					...state,
					previousOperand: evaluate(state),
					operation: payload.operation,
					currentOperand: null,
				};

			case ACTIONS.CLEAR:
				return {};

			case ACTIONS.DELETE_DIGIT:
				//if is the answer of some calculation, when type delete will delete all
				if (state.overwrite) {
					return {
						...state,
						overwrite: null,
						currentOperand: null,
					};
				}

				//if there's no currentOperand don't do nothing
				if (state.currentOperand == null) return state;

				//if there's just one digit, remove it
				if (state.currentOperand.length === 1) {
					return { ...state, currentOperand: null };
				}

				//if there's more than 1 digit and is not a previous answer, delete the last digit of it
				return {
					...state,
					currentOperand: state.currentOperand.slice(0, -1),
				};

			case ACTIONS.EVALUATE:
				// first I'll check if I do have all the values state
				if (
					state.operation == null ||
					state.previousOperand == null ||
					state.currentOperand == null
				) {
					return state;
				}

				//if I do have all the 3 values, than I do the calculation, I return another object changing the prev, the operation and the currentOperand, using the function evaluate that I have created.
				return {
					...state,
					previousOperand: null,

					// if I type another digit after have done a calculation, this number must overwrite the previous answer
					overwrite: true,
					operation: null,
					currentOperand: evaluate(state),
				};
		}
	}

	function evaluate({ currentOperand, previousOperand, operation }) {
		//parseFloat to transform a string to number, to be able to make the operations
		const prev = parseFloat(previousOperand);
		const current = parseFloat(currentOperand);

		// if one of them is NaN, will return me nothing.
		if (isNaN(prev) || isNaN(current)) return '';

		let computation = '';
		switch (operation) {
			case '+':
				computation = prev + current;
				break;
			case '-':
				computation = prev - current;
				break;
			case '*':
				computation = prev * current;
				break;
			case '÷':
				computation = prev / current;
				break;
		}

		//to come back to string the value
		return computation.toString();
	}

	//to format the numbers using commas to make it better
	const INTEGER_FORMATTER = new Intl.NumberFormat('en-us', {
		maximumFractionDigits: 0,
	});

	function formatOperand(operand) {
		//if I don't have operand return me nothing
		if (operand == null) return;
		//otherwise we're gonna get the integer portion and the decimal portion, splitting on the dot point
		const [integer, decimal] = operand.split('.');
		if (decimal == null) return INTEGER_FORMATTER.format(integer);
		return `${INTEGER_FORMATTER.format(integer)}.${decimal}`;
	}

	const [{ currentOperand, previousOperand, operation }, dispatch] =
		useReducer(reducer, {});

	return (
		<div className="calculator-grid">
			<div className="output">
				<div className="previous-operand">
					{formatOperand(previousOperand)} {operation}
				</div>
				<div className="current-operand">
					{formatOperand(currentOperand)}
				</div>
			</div>

			<button
				className="span-two"
				// we don't need to pass any payload, because there aren't any payload to pass
				onClick={() => dispatch({ type: ACTIONS.CLEAR })}>
				AC
			</button>
			<button onClick={() => dispatch({ type: ACTIONS.DELETE_DIGIT })}>
				DEL
			</button>

			{/* <DigitButton digit="÷" dispatch={dispatch} /> */}
			<OperationButton operation="÷" dispatch={dispatch} />

			<DigitButton digit="1" dispatch={dispatch} />
			<DigitButton digit="2" dispatch={dispatch} />
			<DigitButton digit="3" dispatch={dispatch} />
			<OperationButton operation="*" dispatch={dispatch} />

			<DigitButton digit="4" dispatch={dispatch} />
			<DigitButton digit="5" dispatch={dispatch} />
			<DigitButton digit="6" dispatch={dispatch} />
			<OperationButton operation="+" dispatch={dispatch} />

			<DigitButton digit="7" dispatch={dispatch} />
			<DigitButton digit="8" dispatch={dispatch} />
			<DigitButton digit="9" dispatch={dispatch} />
			<OperationButton operation="-" dispatch={dispatch} />

			<DigitButton digit="0" dispatch={dispatch} />
			<DigitButton digit="." dispatch={dispatch} />

			<button
				className="span-two"
				onClick={() => dispatch({ type: ACTIONS.EVALUATE })}>
				=
			</button>
		</div>
	);
}
