// Copyright 2006 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// Changes by Exter-N : extracted goog.string.regExpEscape() into a
//                      standalone CommonJS module

/**
 * Escapes characters in the string that are not safe to use in a RegExp.
 * @param {*} s The string to escape. If not a string, it will be casted
 *     to one.
 * @return {string} A RegExp safe, escaped copy of {@code s}.
 */
export default function regExpEscape(s?: any): string {
    return String(s)
        .replace(/([-()[\]{}+?*.$^|,:#<!\\])/g, '\\$1')
        .replace(/\x08/g, '\\x08'); // eslint-disable-line no-control-regex
}