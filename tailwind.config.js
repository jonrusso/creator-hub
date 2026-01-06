/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'cyan-blue': '#000e1b',
                'onyx': '#0f0f0f',
                'orange-brand': '#ff9b4c',
                'violet-brand': '#8854fc',
                'white-smoke': '#f4f4f4',
            },
            fontFamily: {
                'heading': ['Questrial', 'Space Grotesk', 'Montserrat', 'sans-serif'],
                'body': ['Inter', 'Helvetica Neue', 'Roboto', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
