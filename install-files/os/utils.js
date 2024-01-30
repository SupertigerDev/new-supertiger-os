import { Window } from "./Window.js";

export const getBasePath = (path) => {
    return path.substring(0, path.lastIndexOf("/"))
}


/**
 * Returns an object with a method to generate scoped CSS styles.
 *
 * @param {Window} window - the window object
 * @return {Object} an object with a `css` method to generate scoped CSS styles
 */
export const styled = (window) => {
    return {
        css: (strings, ...values) => {
            var str = strings[0];
            for (var i = 0; i < values.length; i++) {
              str += values[i] + strings[i+1];
            }

            return `<style>
            @scope (#${window.id}) {${str}}
            </style>`;
        }
    }
}