# HashiraAssignment

A Node.js project for solving polynomial coefficients using BigInt arithmetic.

## Files

- **input.json**  
    Contains 2 test cases with polynomial data.

- **polynomial_solver.js**  
    Node.js script that computes polynomial coefficients using BigInt for high-precision calculations.

- **computed_coeffs.json**  
    Output file generated after running the solver, containing the computed coefficients.

## Usage

1. Install [Node.js](https://nodejs.org/) if you haven't already.
2. Place your test cases in `input.json`.
3. Run the solver:

     ```bash
     node polynomial_solver.js
     ```

4. Check `computed_coeffs.json` for the results.

## Example

Sample `input.json` structure:

```json
[
    {
        "coefficients": [1, 2, 3],
        "values": [4, 5, 6]
    },
    {
        "coefficients": [2, 0, -1],
        "values": [3, 0, 1]
    }
]
```

## Notes

- The script uses `BigInt` to handle large numbers accurately.
- Make sure your input follows the expected JSON structure.

## License

MIT
