/**
 * @description Use to generate thriftIDL from a LINE app decompiled with jadx.
 * Depending on the version of LINE, you may need to change Regexp value.
 * Warning: messy code
 */

let includeComment = false;

let inputFile: string | undefined = undefined;

const ttype: Record<number, string> = {
    0: "stop",
    1: "void",
    2: "bool",
    3: "byte",
    4: "double",
    6: "i16",
    8: "i32",
    10: "i64",
    11: "string",
    12: "struct",
    13: "map",
    14: "set",
    15: "list",
};

const replaces: Record<string, string> = {
    "val{KeepContentItemDTO.COLUMN_TITLE}": "title",
    "val{KeepContentDTO.COLUMN_STATUS}": "status",
    "val{Universe.EXTRA_STATE}": "state",
    "val{KeepContentDTO.TABLE_NAME}": "contents",
    "val{KeepContentDTO.COLUMN_MODIFIED_TIME}": "modifiedTime",
    "val{C24208z.f167992i}": "device",
    "val{com.linecorp.linethings.devicemanagement.b.DATA_KEY_ERROR_MESSAGE}":
        "errorMessage",
    "val{VGuardBroadcastReceiver.VGUARD_ALERT_MESSAGE}": "alertMessage",
    "val{C24208z.f167991g}": "location",
    "val{KeepContentDTO.COLUMN_TOTAL_SIZE}": "totalSize",
    "val{EnumC23791p.STATUS_STARTED}": "start",
    "val{JwsHeader.ALGORITHM}": "alg",
    "val{C24208z.e}": "group",
    "val{YW0.l.SCREEN}": "screen",
    "val{STHumanActionParamsType.ST_HUMAN_ACTION_PARAM_BODY_DETECT_INTERVAL}":
        "201",
    "val{STMobileModelType.ST_MOBILE_MODEL_TYPE_NAIL}": "501",
    "val{STMobileModelType.ST_MOBILE_MODEL_TYPE_SEGMENT_TROUSER_LEG}": "409",
    "val{STHumanActionParamsType.ST_HUMAN_ACTION_PARAM_HAIR_MAX_SIZE}": "410",
    "val{SegmentationData.MAX_SEGMENTATION_WIDTH}": "160",
    "val{STHumanActionParamsType.ST_HUMAN_ACTION_PARAM_BODY_STATURE}": "210",
    "val{STHumanActionParamsType.ST_HUMAN_ACTION_PARAM_CAM_FOVX}": "211",
    "val{STHumanActionParamsType.ST_HUMAN_ACTION_PARAM_HEAD_SEGMENT_MAX_COUNT}":
        "304",
    "val{STHumanActionParamsType.ST_HUMAN_ACTION_PARAM_HEAD_SEGMENT_RESULT_BLUR}":
        "305",
    "val{STHumanActionParamsType.ST_HUMAN_ACTION_PARAM_HEAD_SEGMENT_USE_TEMPERATURE}":
        "306",
    "val{STHumanActionParamsType.ST_HUMAN_ACTION_PARAM_HAIR_SEGMENT_RESULT_BLUR}":
        "416",
    "val{STHumanActionParamsType.ST_HUMAN_ACTION_PARAM_HAIR_SEGMENT_USE_TEMPERATURE}":
        "417",
    "val{STHumanActionParamsType.ST_HUMAN_ACTION_PARAM_SKIN_SEGMENT_MIN_THRESHOLD}":
        "432",
    "val{STHumanActionParamsType.ST_HUMAN_ACTION_PARAM_SKIN_SEGMENT_RESULT_ROTATE}":
        "433",
    "val{STHumanActionParamsType.ST_HUMAN_ACTION_PARAM_SKIN_SEGMENT_RESULT_BLUR}":
        "434",
    "val{STHumanActionParamsType.ST_HUMAN_ACTION_PARAM_SKIN_SEGMENT_USE_TEMPERATURE}":
        "435",
    "val{STHumanActionParamsType.ST_HUMAN_ACTION_PARAM_MOUTH_PARSE_RESULT_ROTATE}":
        "450",
    "val{STHumanActionParamsType.ST_HUMAN_ACTION_PARAM_FACE_OCCLUSION_SEGMENT_RESULT_BLUR}":
        "464",
    "val{STHumanActionParamsType.ST_HUMAN_ACTION_PARAM_FACE_OCCLUSION_SEGMENT_USE_TEMPERATURE}":
        "467",
    "val{STHumanActionParamsType.ST_HUMAN_ACTION_PARAM_SKY_SEGMENT_MIN_THRESHOLD}":
        "513",
    "val{STHumanActionParamsType.ST_HUMAN_ACTION_PARAM_SKY_SEGMENT_REFINE_CPU_PROCESS}":
        "514",
    "val{STHumanActionParamsType.ST_HUMAN_ACTION_PARAM_DEPTH_ESTIMATION_MAX_SIZE}":
        "515",
    "val{BuildConfig.VERSION_CODE}": "200",
    "val{YukiFaceTriggerType.FaceTriggerConstants.kAr3dStart}": "524288",
    "val{STHumanActionParamsType.ST_HUMAN_ACTION_PARAM_HAND_THRESHOLD}": "104",
    "val{STResultCode.READY_TIME_OUT}": "105",
    "val{STResultCode.ONLINE_TIME_OUT}": "107",
    "val{STResultCode.DEFAKE_HACK}": "108",
    "val{STResultCode.DEFAKE_FRAMES_NOT_ENOUGH}": "109",
    "val{Const.DEFAULT_CODE}": "127",
    "val{FaceData.SENSETIME_EXTRA_SHAPE_SIZE}": "134",
    "val{KotlinVersion.MAX_COMPONENT_VALUE}": "255",
    "val{Integer.MAX_VALUE}": "2147483647",
    "val{STResultCode.LIVE_COLOR_HACK}": "1102",
    "val{STResultCode.LIVE_COLOR_HACK_LIGHT_CAPTCHA}": "1103",
    "val{STResultCode.LIVE_COLOR_HACK_LIVENESS_AGNOSTIC}": "1104",
    "val{STResultCode.LIVE_COLOR_HACK_LIGHT_CAPTCHA_SAMPLE_FAILED}": "1105",
    "val{STResultCode.LIVE_COLOR_HACK_WEAK_LIGHT}": "1107",
    "val{NetworkManager.TYPE_NONE}": "none",
    "com_linecorp_square_protocol_thrift_common_": "",
    "com_linecorp_square_protocol_thrift_": "",
    " list ": " list<_any> ",
    "list> ": "list<_any>> ",
    " list<map> ": "list<_any>",
    " set ": " set<_any> ",
    " map ": " map<_anykey,_any> ",
    " struct ": " _any ",
    "i80": "I80",
};

function replace(input: string) {
    for (const k in replaces) {
        if (Object.prototype.hasOwnProperty.call(replaces, k)) {
            const value = replaces[k];
            input = input.replaceAll(k, value);
        }
    }
    return input;
}

function getPackage(input: string) {
    const packageReg = /package (?<name>.*?);/;
    const package_name = packageReg.exec(inputFile || input);
    if (!(package_name && package_name.groups && package_name.groups.name)) {
        return "";
    }
    return package_name.groups.name;
}

function getPropertyType(input: string, target: string) {
    const typeReg = new RegExp(`public (?<type>.*) ${target};`);
    const type_name = typeReg.exec(input);
    if (!(type_name && type_name.groups && type_name.groups.type)) {
        return;
    }
    return type_name.groups.type;
}

function getImport(input: string, target: string) {
    const package_name = getPackage(input);
    const importReg = new RegExp(`import (?<import>.*\\.${target});`);
    const import_name = importReg.exec(inputFile || input);
    if (!(import_name && import_name.groups && import_name.groups.import)) {
        if (target.includes(package_name)) {
            return target.replaceAll(".", "_").replaceAll(" ", "");
        }
        return package_name.replaceAll(".", "_").replaceAll(" ", "") + "_" +
            target.replaceAll(".", "_").replaceAll(" ", "");
    }
    return import_name.groups.import.replaceAll(".", "_").replaceAll(" ", "");
}

function fieldclass2enum(input: string, classname: string, fieldname: string) {
    const x = new RegExp(
        `gVar\\.x\\(${classname}\\.${fieldname}\\);\n.*gVar\\.A\\(.*\\.(?<enum>.*?)\\.getValue\\(\\)\\)`,
    );
    const struct = x.exec(input);
    if (!struct?.groups?.enum) {
        return;
    }
    const type = getPropertyType(input, struct.groups.enum);
    if (!type) {
        return;
    }
    return getImport(input, type);
}

function fieldclass2list(
    input: string,
    classname: string,
    fieldname: string,
): [string, string?] | undefined {
    const x = new RegExp(
        `gVar\\.x\\(${classname}\\.${fieldname}\\);\\n *gVar\\.C\\(new we1\\.d\\(\\(byte\\) (?<type>.*?), .*\n *Iterator .*\\(\\);\n *while \\(.*hasNext\\(\\)\\) \\{\\n *\\(\\((?<class>.*?)\\) .*next\\(\\)\\)\\.write\\(gVar\\);`,
    );
    const struct = x.exec(input);
    if (!struct?.groups?.type) {
        const x2 = new RegExp(
            `gVar\\.x\\(${classname}\\.${fieldname}\\);\\n *gVar\\.C\\(new we1\\.d\\(\\(byte\\) (?<type>.*?), .*\n *Iterator<(?<class>.*?)> .*\\(\\);`,
        );
        const struct = x2.exec(input);
        if (struct?.groups) {
            return [struct.groups.type, getImport(input, struct.groups.class)];
        } else {
            const x3 = new RegExp(
                `gVar\\.x\\(${classname}\\.${fieldname}\\);\\n *gVar\\.C\\(new we1\\.d\\(\\(byte\\) (?<type>.*?), `,
            );
            const struct = x3.exec(input);
            if (struct?.groups?.type) {
                return [struct.groups.type];
            } else {
                return;
            }
        }
    }
    const t = getImport(input, struct.groups.class);
    return [struct.groups.type, t];
}

function fieldclass2set(
    input: string,
    classname: string,
    fieldname: string,
): [string, string?] | undefined {
    const x = new RegExp(
        `gVar\\.x\\(${classname}\\.${fieldname}\\);\\n *gVar\\.G\\(new .*k\\(\\(byte\\) (?<type>.*?), .*\\.(?<prop>.*?)\\.size\\(\\)`,
    );
    const struct = x.exec(input);
    if (!struct?.groups?.type) {
        return;
    }
    if (struct.groups.type === "8") {
        const enumname = /Set<(?<name>.*?)>/.exec(
            getPropertyType(input, struct.groups.prop) || "",
        );
        if (!enumname?.groups) {
            return [struct.groups.type];
        }
        return [struct.groups.type, getImport(input, enumname.groups.name)];
    } else if (struct.groups.type === "12") {
        const x2 = new RegExp(
            `gVar\\.x\\(${classname}\\.${fieldname}\\);\\n *gVar\\.G\\(new .*k\\(\\(byte\\) (?<type>.*?), .*\\.(?<prop>.*?)\\.size\\(\\)\\)\\);\\n *Iterator.*\\n *while \\(.*hasNext\\(\\)\\) \\{\\n *\\(\\((?<class>.*?)\\) .*\\.next\\(\\)\\)\\.write\\(gVar\\);`,
        );
        const result = x2.exec(input);
        if (result?.groups) {
            return [struct.groups.type, getImport(input, result.groups.class)];
        }
    }
    return [struct.groups.type];
}

function fieldclass2map(
    input: string,
    classname: string,
    fieldname: string,
): [[number, number], string?] | undefined {
    const x = new RegExp(
        `gVar\\.x\\(${classname}\\.${fieldname}\\);\\n *gVar\\.D\\(new .*e\\(\\(byte\\) (?<ktype>.*?), \\(byte\\) (?<vtype>.*?), `,
    );
    const struct = x.exec(input);
    if (!struct?.groups) {
        return;
    }
    const kv: [number, number] = [
        parseInt(struct.groups.ktype),
        parseInt(struct.groups.vtype),
    ];
    if (kv[1] === 12) {
        const x2 = new RegExp(
            `gVar\\.x\\(${classname}\\.${fieldname}\\);\\n *gVar\\.D\\(new .*e\\(\\(byte\\) .*, \\(byte\\) .*\\n *for \\(Map.Entry.*\\n.*\\n *\\(\\((?<class>.*?)\\) .*\\.getValue\\(\\)\\)\\.write\\(gVar\\);`,
        );
        const result = x2.exec(input);
        if (result?.groups) {
            return [kv, getImport(input, result.groups.class)];
        } else {
            const x3 = new RegExp(
                `gVar\\.x\\(${classname}\\.${fieldname}\\);\\n *gVar\\.D\\(new .*e\\(\\(byte\\) .*, \\(byte\\) .*\\n *for \\(Map.Entry<.*,(?<class>.*?)>`,
            );
            const result = x3.exec(input);
            if (result?.groups) {
                return [kv, getImport(input, result.groups.class)];
            }
        }
    }
    return [kv];
}

function fieldclass2struct(
    input: string,
    classname: string,
    field: string,
    fieldid: number,
) {
    const x = new RegExp(
        `gVar\\.x\\(${classname}\\.${field}\\);\n.*\\.(?<struct>.*?)\\.write\\(gVar\\)`,
    );
    const struct = x.exec(input);
    if (!struct?.groups?.struct) {
        const x2 = new RegExp(
            `gVar\\.x\\(${classname}\\.${field}\\);\n *(?<class>.*?) .* = .*\\..*;`,
        );
        const struct = x2.exec(input);
        if (!struct?.groups?.class) {
            return fieldclass2struct2(input, fieldid);
        }
        return getImport(input, struct?.groups?.class);
    }
    const type = getPropertyType(input, struct.groups.struct);
    if (!type) {
        return;
    }
    return getImport(input, type);
}

function fieldclass2struct2(input: string, fieldid: number) {
    const x = new RegExp(
        `if \\(.* == ${fieldid}\\) \\{\\n *if \\(!\\(obj instanceof (?<class>.*?)\\)\\) \\{\\n *throw new ClassCastException\\(`,
    );
    const struct = x.exec(input);
    if (!struct?.groups?.class) {
        return fieldclass2struct3(input, fieldid);
    }
    return getImport(input, struct?.groups?.class);
}
function fieldclass2struct3(input: string, fieldid: number) {
    const x = new RegExp(
        `case ${fieldid}:\\n *if \\(!\\(obj instanceof (?<class>.*?)\\)\\) \\{\\n *throw new ClassCastException\\(`,
    );
    const struct = x.exec(input);
    if (!struct?.groups?.class) {
        return fieldclass2struct4(input, fieldid);
    }
    return getImport(input, struct?.groups?.class);
}
function fieldclass2struct4(input: string, fieldid: number) {
    const x = new RegExp(
        `case .* ${fieldid} .*\\n *if \\(!\\(obj instanceof (?<class>.*?)\\)\\) \\{\\n *throw new ClassCastException\\(`,
    );
    const struct = x.exec(input);
    if (!struct?.groups?.class) {
        return;
    }
    return getImport(input, struct?.groups?.class);
}

class TField {
    type: string;
    id: number;
    name: string;
    constructor(type: number | string, id: number, name?: string) {
        this.id = id;
        this.type = typeof type === "number" ? ttype[type] : type;
        this.name = name || "val_" + id.toString();
    }
    toString() {
        return `${this.id}: ${this.type} ${this.name};`;
    }
}

class TStruct {
    type = "struct";
    name: string;
    fields: TField[] = [];
    memo: string;
    realname?: string;
    package: string = "";
    constructor(name?: string) {
        this.memo = this.name = name ||
            "struct_" + (Math.floor(Math.random())).toString(16);
        if (
            this.memo.includes(" extends org.apache.thrift.i") ||
            this.memo.includes(" extends i")
        ) {
            this.type = "exception";
            this.memo = this.name = this.memo.split(" ")[0];
        }
    }

    toString() {
        this.fields.sort((a, b) => {
            return parseInt(a.toString().split(":")[0]) -
                parseInt(b.toString().split(":")[0]);
        });
        if (this.realname) {
            replaces[` ${this.package.replaceAll(".", "_")}_${this.name} `] =
                ` ${this.realname} `;
            replaces[`${this.package.replaceAll(".", "_")}_${this.name}>`] =
                `${this.realname}>`;
        }
        if (includeComment) {
            return `/* ${this.memo} */
${this.type} ${this.package.replaceAll(".", "_")}_${this.name} {
    ${this.fields.join("\n    ")}
}`;
        }
        return `${this.type} ${
            this.realname || `${this.package.replaceAll(".", "_")}_${this.name}`
        } {
    ${this.fields.join("\n    ")}
}`;
    }

    static load(input: string) {
        const nameReg =
            /public.*? class (?<name>.*?) implements .*?, Serializable, Cloneable, Comparable.*?/;
        const nameReg2 =
            /public.*? class (?<name>.*?) extends org\.apache\.thrift\.n.*?/;
        const nameReg3 = /public class (?<name>.*?) extends n</;
        const fieldReg =
            /public static final C38399c (?<prop>.*?) = new C38399c\((?<name>.*?), \(byte\) (?<type>.*?), (?<id>.*?)\);/g;
        const structReg = /new StringBuilder\("(?<name>.*?)\(.*?"\)/;
        let name = nameReg.exec(input);
        if (!(name && name.groups && name.groups.name)) {
            name = nameReg2.exec(input);
            if (!(name && name.groups && name.groups.name)) {
                name = nameReg3.exec(input);
                if (!(name && name.groups && name.groups.name)) {
                    return;
                }
            }
        }
        const struct = new this(name.groups.name);
        struct.package = getPackage(input) || "";
        const struct_name = structReg.exec(input);
        if ((struct_name && struct_name.groups && struct_name.groups.name)) {
            struct.realname = struct_name.groups.name;
        }
        while (true) {
            const fields = fieldReg.exec(input);
            if ((fields && fields.groups)) {
                const fname = fields.groups.prop;
                let type: string | number = parseInt(fields.groups.type);
                if (8 === parseInt(fields.groups.type)) {
                    type = fieldclass2enum(
                        input,
                        name.groups.name.split(" ")[0],
                        fname,
                    ) || type;
                } else if (12 === parseInt(fields.groups.type)) {
                    type = fieldclass2struct(
                        input,
                        name.groups.name.split(" ")[0],
                        fname,
                        parseInt(fields.groups.id),
                    ) || type;
                } else if (13 === parseInt(fields.groups.type)) {
                    const [map, struct] = fieldclass2map(
                        input,
                        name.groups.name.split(" ")[0],
                        fname,
                    ) || [];
                    if (map) {
                        if ((map[1]) === 12 && struct) {
                            type = `map<${ttype[map[0]]}, ${struct}>`;
                        } else {
                            type = `map<${ttype[map[0]]}, ${ttype[map[1]]}>`;
                        }
                    }
                } else if (14 === parseInt(fields.groups.type)) {
                    const set = fieldclass2set(
                        input,
                        name.groups.name.split(" ")[0],
                        fname,
                    );
                    if (set) {
                        if (parseInt(set[0]) === 12 && set[1]) {
                            type = `set<${set[1]}>`;
                        } else if (parseInt(set[0]) === 8 && set[1]) {
                            type = `set<${set[1]}>`;
                        } else {
                            type = `set<${ttype[parseInt(set[0])]}>`;
                        }
                    }
                } else if (15 === parseInt(fields.groups.type)) {
                    const list = fieldclass2list(
                        input,
                        name.groups.name.split(" ")[0],
                        fname,
                    );
                    if (list) {
                        if (parseInt(list[0]) === 12 && list[1]) {
                            type = `list<${list[1]}>`;
                        } else {
                            type = `list<${ttype[parseInt(list[0])]}>`;
                        }
                    }
                }
                struct.fields.push(
                    new TField(
                        type,
                        parseInt(fields.groups.id),
                        fields.groups.name.startsWith('"')
                            ? fields.groups.name.slice(1, -1)
                            : `val{${fields.groups.name}}`,
                    ),
                );
            } else {
                break;
            }
        }
        return struct;
    }
    static loadSquareServices(input: string) {
        inputFile = input;
        const list: TStruct[] = [];
        const result = [
            ...input.matchAll(
                /public.*? class .*? implements .*?, Serializable, Cloneable, Comparable.*?/g,
            ),
        ];
        for (let i = 0; i < result.length; i++) {
            console.warn(i, "/", result.length);
            const res = this.loadSquareService(
                input,
                input.substring(result[i].index, result[i + 1]?.index),
            );
            if (res) {
                list.push(res);
            }
        }
        inputFile = undefined;
        return list;
    }
    static loadSquareService(input: string, classinput: string) {
        const nameReg =
            /public.*? class (?<name>.*?) implements .*?, Serializable, Cloneable, Comparable.*?/;
        const fieldReg =
            /public static final C38399c (?<prop>.*?) = new C38399c\((?<name>.*?), \(byte\) (?<type>.*?), (?<id>.*?)\);/g;
        const structReg = /new StringBuilder\("(?<name>.*?)\(.*?"\)/;
        const name = nameReg.exec(classinput);
        if (!(name && name.groups && name.groups.name)) {
            return;
        }
        const struct = new this("SquareService_" + name.groups.name);
        struct.package = getPackage(input) || "";
        const struct_name = structReg.exec(input);
        if ((struct_name && struct_name.groups && struct_name.groups.name)) {
            struct.realname = struct_name.groups.name;
        }
        while (true) {
            const fields = fieldReg.exec(classinput);
            if ((fields && fields.groups)) {
                const fname = fields.groups.prop;
                let type: string | number = parseInt(fields.groups.type);
                if (8 === parseInt(fields.groups.type)) {
                    type = fieldclass2enum(
                        classinput,
                        name.groups.name.split(" ")[0],
                        fname,
                    ) || type;
                } else if (12 === parseInt(fields.groups.type)) {
                    type = fieldclass2struct(
                        classinput,
                        name.groups.name.split(" ")[0],
                        fname,
                        parseInt(fields.groups.id),
                    ) || type;
                } else if (13 === parseInt(fields.groups.type)) {
                    const [map, struct] = fieldclass2map(
                        classinput,
                        name.groups.name.split(" ")[0],
                        fname,
                    ) || [];
                    if (map) {
                        if ((map[1]) === 12 && struct) {
                            type = `map<${ttype[map[0]]}, ${struct}>`;
                        } else {
                            type = `map<${ttype[map[0]]}, ${ttype[map[1]]}>`;
                        }
                    }
                } else if (14 === parseInt(fields.groups.type)) {
                    const set = fieldclass2set(
                        classinput,
                        name.groups.name.split(" ")[0],
                        fname,
                    );
                    if (set) {
                        if (parseInt(set[0]) === 12 && set[1]) {
                            type = `set<${set[1]}>`;
                        } else if (parseInt(set[0]) === 8 && set[1]) {
                            type = `set<${set[1]}>`;
                        } else {
                            type = `set<${ttype[parseInt(set[0])]}>`;
                        }
                    }
                } else if (15 === parseInt(fields.groups.type)) {
                    const list = fieldclass2list(
                        classinput,
                        name.groups.name.split(" ")[0],
                        fname,
                    );
                    if (list) {
                        if (parseInt(list[0]) === 12 && list[1]) {
                            type = `list<${list[1]}>`;
                        } else {
                            type = `list<${ttype[parseInt(list[0])]}>`;
                        }
                    }
                }
                struct.fields.push(
                    new TField(
                        type,
                        parseInt(fields.groups.id),
                        fields.groups.name.startsWith('"')
                            ? fields.groups.name.slice(1, -1)
                            : `val{${fields.groups.name}}`,
                    ),
                );
            } else {
                break;
            }
        }
        return struct;
    }
}

class TEnum {
    value: { name: string; value: string }[] = [];
    memo: string = "";
    package: string = "";
    realname?: string;
    constructor(public name: string) {
    }

    toString() {
        if (!includeComment) {
            return `enum ${
                this.realname ||
                (this.package.replaceAll(".", "_") + "_" + this.name)
            } {
                ${this.value.map((e) => `${e.name} = ${e.value};`).join("\n")}
                }`;
        }
        if (this.realname) {
            replaces[` ${this.package.replaceAll(".", "_")}_${this.name} `] =
                ` ${this.realname} `;
            replaces[`${this.package.replaceAll(".", "_")}_${this.name}>`] =
                `${this.realname}>`;
        }
        if (includeComment) {
            return `/* ${this.memo} */
enum ${this.package.replaceAll(".", "_") + "_" + this.name} {
${this.value.map((e) => `${e.name} = ${e.value};`).join("\n")}
}`;
        }
        return `enum ${this.package.replaceAll(".", "_")}_${this.name} {
${this.value.map((e) => `${e.name} = ${e.value};`).join("\n")}
}`;
    }
    searchAndRename(input: string) {
        try {
            const re = new RegExp(
                `enum (?<name>.*?) {\n${this.value[0].name} = ${
                    this.value[0].value
                };\n${this.value[1].name} = ${this.value[1].value};\n${
                    this.value[2].name
                } = ${this.value[2].value};\n${this.value[3].name} = ${
                    this.value[3].value
                };`,
            );
            const result = re.exec(input);
            if (result && result?.groups?.name) {
                this.realname = result.groups.name;
            }
        } catch (_e) {
            _e;
        }
    }
    static load(input: string) {
        const nameReg = /public enum (?<name>.*?) implements .*?h \{/;
        const valueReg = / *?(?<name>.*?)\((?<value>.*?)\)[,;]/g;
        const name = nameReg.exec(input);
        if (!(name && name.groups && name.groups.name)) {
            return;
        }
        const tenum = new this(name.groups.name);
        tenum.package = getPackage(input) || "";
        while (true) {
            const value = valueReg.exec(input);
            if (value && value.groups && value.groups.name) {
                tenum.value.push({
                    name: (value.groups.name),
                    value: Number.isNaN(Number(value.groups.value))
                        ? `val{${value.groups.value}}`
                        : (value.groups.value),
                });
            } else {
                break;
            }
        }
        return tenum;
    }
}

const _line = await Deno.readTextFile("./_line.thrift");

const thrift: (TEnum | TStruct)[] = [];
for (const fpath of (await Deno.readTextFile("./memo.txt")).split("\n")) {
    try {
        if (fpath.endsWith("Service.java")) {
            const f = await Deno.readTextFile(fpath);
            const structs = TStruct.loadSquareServices(f);
            structs.forEach((e) => {
                e.memo += " @" + fpath;
            });
            thrift.push(...structs);
            continue;
        }
        const f = await Deno.readTextFile(fpath);
        const struct = TStruct.load(f);
        if (struct) {
            struct.memo += " @" + fpath;
            thrift.push(struct);
        } else {
            const tenum = TEnum.load(f);
            if (tenum) {
                tenum.memo += fpath;
                tenum.searchAndRename(_line);
                thrift.push(tenum);
            } else {
                console.error("none", fpath);
            }
        }
    } catch (e) {
        console.error(e);
    }
}

thrift.sort();

includeComment = true;

console.log(replace(thrift.join("\n\n")));
