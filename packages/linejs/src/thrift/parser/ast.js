// Copyright (c) 2020 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

// Copyright (c) 2015 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of self software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and self permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

/* eslint max-params:[1, 10] */
"use strict";

var none = {};
var module = {};
module.exports = {};
module.exports.Program = Program;
function Program(headers, definitions) {
	this.type = "Program";
	this.headers = headers;
	this.definitions = definitions;
}

module.exports.Identifier = Identifier;
function Identifier(name, line, column) {
	this.type = "Identifier";
	this.name = name;
	this.as = null;
}

module.exports.Include = Include;
function Include(id, namespace, line, column) {
	this.type = "Include";
	this.id = id;
	this.namespace = namespace;
}

module.exports.Namespace = Namespace;
function Namespace(id, scope) {
	this.type = "Namespace";
	this.id = id;
	this.scope = scope;
}

module.exports.Typedef = Typedef;
function Typedef(type, id, annotations) {
	this.type = "Typedef";
	this.valueType = type;
	this.id = id;
	this.annotations = annotations || none;
}

module.exports.BaseType = BaseType;
function BaseType(type, annotations) {
	this.type = "BaseType";
	this.baseType = type;
	this.annotations = annotations || none;
}

module.exports.Enum = Enum;
function Enum(id, definitions, annotations) {
	this.type = "Enum";
	this.id = id;
	this.definitions = definitions;
	this.annotations = annotations || none;
}

module.exports.EnumDefinition = EnumDefinition;
function EnumDefinition(id, value, annotations) {
	this.type = "EnumDefinition";
	this.fieldType = new BaseType("i32");
	this.id = id;
	this.value = value;
	this.annotations = annotations || none;
}

module.exports.Senum = Senum;
function Senum(id, definitions, annotations) {
	this.type = "Senum";
	this.id = id;
	this.senumDefinitions = definitions;
	this.annotations = annotations || none;
}

module.exports.Const = Const;
function Const(id, fieldType, value) {
	this.type = "Const";
	this.id = id;
	this.fieldType = fieldType;
	this.value = value;
}

module.exports.ConstList = ConstList;
function ConstList(values) {
	this.type = "ConstList";
	this.values = values;
}

module.exports.ConstMap = ConstMap;
function ConstMap(entries) {
	this.type = "ConstMap";
	this.entries = entries;
}

module.exports.ConstEntry = ConstEntry;
function ConstEntry(key, value) {
	this.type = "ConstEntry";
	this.key = key;
	this.value = value;
}

module.exports.Struct = Struct;
function Struct(id, fields, annotations) {
	this.type = "Struct";
	this.id = id;
	this.fields = fields;
	this.isArgument = false;
	this.isResult = false;
	this.annotations = annotations || none;
}

module.exports.Union = Union;
function Union(id, fields, annotations) {
	this.type = "Union";
	this.id = id;
	this.fields = fields;
	this.annotations = annotations || none;
}

module.exports.Exception = Exception;
function Exception(id, fields, annotations) {
	this.type = "Exception";
	this.id = id;
	this.fields = fields;
	this.annotations = annotations || none;
}

module.exports.Service = Service;
function Service(id, functions, annotations, baseService) {
	this.type = "Service";
	this.id = id;
	this.functions = functions;
	this.baseService = baseService;
	this.annotations = annotations || none;
}

module.exports.FunctionDefinition = FunctionDefinition;
function FunctionDefinition(id, fields, ft, _throws, annotations, oneway) {
	this.type = "Function";
	this.id = id;
	this.returns = ft;
	this.fields = fields;
	this.fields.isArgument = true;
	this.throws = _throws;
	this.oneway = oneway;
	this.annotations = annotations || none;
}

module.exports.Field = Field;
function Field(id, ft, name, req, fv, annotations) {
	this.type = "Field";
	this.id = id;
	this.name = name;
	this.valueType = ft;
	this.required = req === "required";
	this.optional = req === "optional";
	this.defaultValue = fv;
	this.annotations = annotations || none;
}

module.exports.FieldIdentifier = FieldIdentifier;
function FieldIdentifier(value, line, column) {
	this.type = "FieldIdentifier";
	this.value = value;
}

module.exports.MapType = MapType;
function MapType(keyType, valueType, annotations) {
	this.type = "Map";
	this.keyType = keyType;
	this.valueType = valueType;
	this.annotations = annotations || none;
}

module.exports.SetType = SetType;
function SetType(valueType, annotations) {
	this.type = "Set";
	this.valueType = valueType;
	this.annotations = annotations || none;
}

module.exports.ListType = ListType;
function ListType(valueType, annotations) {
	this.type = "List";
	this.valueType = valueType;
	this.annotations = annotations || none;
}

module.exports.TypeAnnotation = TypeAnnotation;
function TypeAnnotation(name, value) {
	this.type = "TypeAnnotation";
	this.name = name;
	this.value = value;
}

module.exports.Comment = Comment;
function Comment(value) {
	this.type = "Comment";
	this.value = value;
}

module.exports.Literal = Literal;
function Literal(value) {
	this.type = "Literal";
	this.value = value;
}
export default module.exports;
