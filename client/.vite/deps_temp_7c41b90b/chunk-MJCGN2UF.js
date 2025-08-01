import {
  __publicField
} from "./chunk-WOOG5QLI.js";

// node_modules/drizzle-orm/entity.js
var entityKind = Symbol.for("drizzle:entityKind");
var hasOwnEntityKind = Symbol.for("drizzle:hasOwnEntityKind");
function is(value, type) {
  if (!value || typeof value !== "object") {
    return false;
  }
  if (value instanceof type) {
    return true;
  }
  if (!Object.prototype.hasOwnProperty.call(type, entityKind)) {
    throw new Error(
      `Class "${type.name ?? "<unknown>"}" doesn't look like a Drizzle entity. If this is incorrect and the class is provided by Drizzle, please report this as a bug.`
    );
  }
  let cls = Object.getPrototypeOf(value).constructor;
  if (cls) {
    while (cls) {
      if (entityKind in cls && cls[entityKind] === type[entityKind]) {
        return true;
      }
      cls = Object.getPrototypeOf(cls);
    }
  }
  return false;
}

// node_modules/drizzle-orm/column.js
var _a;
_a = entityKind;
var Column = class {
  constructor(table, config) {
    __publicField(this, "name");
    __publicField(this, "keyAsName");
    __publicField(this, "primary");
    __publicField(this, "notNull");
    __publicField(this, "default");
    __publicField(this, "defaultFn");
    __publicField(this, "onUpdateFn");
    __publicField(this, "hasDefault");
    __publicField(this, "isUnique");
    __publicField(this, "uniqueName");
    __publicField(this, "uniqueType");
    __publicField(this, "dataType");
    __publicField(this, "columnType");
    __publicField(this, "enumValues");
    __publicField(this, "generated");
    __publicField(this, "generatedIdentity");
    __publicField(this, "config");
    this.table = table;
    this.config = config;
    this.name = config.name;
    this.keyAsName = config.keyAsName;
    this.notNull = config.notNull;
    this.default = config.default;
    this.defaultFn = config.defaultFn;
    this.onUpdateFn = config.onUpdateFn;
    this.hasDefault = config.hasDefault;
    this.primary = config.primaryKey;
    this.isUnique = config.isUnique;
    this.uniqueName = config.uniqueName;
    this.uniqueType = config.uniqueType;
    this.dataType = config.dataType;
    this.columnType = config.columnType;
    this.generated = config.generated;
    this.generatedIdentity = config.generatedIdentity;
  }
  mapFromDriverValue(value) {
    return value;
  }
  mapToDriverValue(value) {
    return value;
  }
  // ** @internal */
  shouldDisableInsert() {
    return this.config.generated !== void 0 && this.config.generated.type !== "byDefault";
  }
};
__publicField(Column, _a, "Column");

// node_modules/drizzle-orm/column-builder.js
var _a2;
_a2 = entityKind;
var ColumnBuilder = class {
  constructor(name2, dataType, columnType) {
    __publicField(this, "config");
    /**
     * Alias for {@link $defaultFn}.
     */
    __publicField(this, "$default", this.$defaultFn);
    /**
     * Alias for {@link $onUpdateFn}.
     */
    __publicField(this, "$onUpdate", this.$onUpdateFn);
    this.config = {
      name: name2,
      keyAsName: name2 === "",
      notNull: false,
      default: void 0,
      hasDefault: false,
      primaryKey: false,
      isUnique: false,
      uniqueName: void 0,
      uniqueType: void 0,
      dataType,
      columnType,
      generated: void 0
    };
  }
  /**
   * Changes the data type of the column. Commonly used with `json` columns. Also, useful for branded types.
   *
   * @example
   * ```ts
   * const users = pgTable('users', {
   * 	id: integer('id').$type<UserId>().primaryKey(),
   * 	details: json('details').$type<UserDetails>().notNull(),
   * });
   * ```
   */
  $type() {
    return this;
  }
  /**
   * Adds a `not null` clause to the column definition.
   *
   * Affects the `select` model of the table - columns *without* `not null` will be nullable on select.
   */
  notNull() {
    this.config.notNull = true;
    return this;
  }
  /**
   * Adds a `default <value>` clause to the column definition.
   *
   * Affects the `insert` model of the table - columns *with* `default` are optional on insert.
   *
   * If you need to set a dynamic default value, use {@link $defaultFn} instead.
   */
  default(value) {
    this.config.default = value;
    this.config.hasDefault = true;
    return this;
  }
  /**
   * Adds a dynamic default value to the column.
   * The function will be called when the row is inserted, and the returned value will be used as the column value.
   *
   * **Note:** This value does not affect the `drizzle-kit` behavior, it is only used at runtime in `drizzle-orm`.
   */
  $defaultFn(fn) {
    this.config.defaultFn = fn;
    this.config.hasDefault = true;
    return this;
  }
  /**
   * Adds a dynamic update value to the column.
   * The function will be called when the row is updated, and the returned value will be used as the column value if none is provided.
   * If no `default` (or `$defaultFn`) value is provided, the function will be called when the row is inserted as well, and the returned value will be used as the column value.
   *
   * **Note:** This value does not affect the `drizzle-kit` behavior, it is only used at runtime in `drizzle-orm`.
   */
  $onUpdateFn(fn) {
    this.config.onUpdateFn = fn;
    this.config.hasDefault = true;
    return this;
  }
  /**
   * Adds a `primary key` clause to the column definition. This implicitly makes the column `not null`.
   *
   * In SQLite, `integer primary key` implicitly makes the column auto-incrementing.
   */
  primaryKey() {
    this.config.primaryKey = true;
    this.config.notNull = true;
    return this;
  }
  /** @internal Sets the name of the column to the key within the table definition if a name was not given. */
  setName(name2) {
    if (this.config.name !== "")
      return;
    this.config.name = name2;
  }
};
__publicField(ColumnBuilder, _a2, "ColumnBuilder");

// node_modules/drizzle-orm/table.utils.js
var TableName = Symbol.for("drizzle:Name");

// node_modules/drizzle-orm/pg-core/foreign-keys.js
var _a3;
_a3 = entityKind;
var ForeignKeyBuilder = class {
  constructor(config, actions) {
    /** @internal */
    __publicField(this, "reference");
    /** @internal */
    __publicField(this, "_onUpdate", "no action");
    /** @internal */
    __publicField(this, "_onDelete", "no action");
    this.reference = () => {
      const { name: name2, columns, foreignColumns } = config();
      return { name: name2, columns, foreignTable: foreignColumns[0].table, foreignColumns };
    };
    if (actions) {
      this._onUpdate = actions.onUpdate;
      this._onDelete = actions.onDelete;
    }
  }
  onUpdate(action) {
    this._onUpdate = action === void 0 ? "no action" : action;
    return this;
  }
  onDelete(action) {
    this._onDelete = action === void 0 ? "no action" : action;
    return this;
  }
  /** @internal */
  build(table) {
    return new ForeignKey(table, this);
  }
};
__publicField(ForeignKeyBuilder, _a3, "PgForeignKeyBuilder");
var _a4;
_a4 = entityKind;
var ForeignKey = class {
  constructor(table, builder) {
    __publicField(this, "reference");
    __publicField(this, "onUpdate");
    __publicField(this, "onDelete");
    this.table = table;
    this.reference = builder.reference;
    this.onUpdate = builder._onUpdate;
    this.onDelete = builder._onDelete;
  }
  getName() {
    const { name: name2, columns, foreignColumns } = this.reference();
    const columnNames = columns.map((column) => column.name);
    const foreignColumnNames = foreignColumns.map((column) => column.name);
    const chunks = [
      this.table[TableName],
      ...columnNames,
      foreignColumns[0].table[TableName],
      ...foreignColumnNames
    ];
    return name2 ?? `${chunks.join("_")}_fk`;
  }
};
__publicField(ForeignKey, _a4, "PgForeignKey");
function foreignKey(config) {
  function mappedConfig() {
    const { name: name2, columns, foreignColumns } = config;
    return {
      name: name2,
      columns,
      foreignColumns
    };
  }
  return new ForeignKeyBuilder(mappedConfig);
}

// node_modules/drizzle-orm/pg-core/unique-constraint.js
function unique(name2) {
  return new UniqueOnConstraintBuilder(name2);
}
function uniqueKeyName(table, columns) {
  return `${table[TableName]}_${columns.join("_")}_unique`;
}
var _a5;
_a5 = entityKind;
var UniqueConstraintBuilder = class {
  constructor(columns, name2) {
    /** @internal */
    __publicField(this, "columns");
    /** @internal */
    __publicField(this, "nullsNotDistinctConfig", false);
    this.name = name2;
    this.columns = columns;
  }
  nullsNotDistinct() {
    this.nullsNotDistinctConfig = true;
    return this;
  }
  /** @internal */
  build(table) {
    return new UniqueConstraint(table, this.columns, this.nullsNotDistinctConfig, this.name);
  }
};
__publicField(UniqueConstraintBuilder, _a5, "PgUniqueConstraintBuilder");
var _a6;
_a6 = entityKind;
var UniqueOnConstraintBuilder = class {
  constructor(name2) {
    /** @internal */
    __publicField(this, "name");
    this.name = name2;
  }
  on(...columns) {
    return new UniqueConstraintBuilder(columns, this.name);
  }
};
__publicField(UniqueOnConstraintBuilder, _a6, "PgUniqueOnConstraintBuilder");
var _a7;
_a7 = entityKind;
var UniqueConstraint = class {
  constructor(table, columns, nullsNotDistinct, name2) {
    __publicField(this, "columns");
    __publicField(this, "name");
    __publicField(this, "nullsNotDistinct", false);
    this.table = table;
    this.columns = columns;
    this.name = name2 ?? uniqueKeyName(this.table, this.columns.map((column) => column.name));
    this.nullsNotDistinct = nullsNotDistinct;
  }
  getName() {
    return this.name;
  }
};
__publicField(UniqueConstraint, _a7, "PgUniqueConstraint");

// node_modules/drizzle-orm/pg-core/utils/array.js
function parsePgArrayValue(arrayString, startFrom, inQuotes) {
  for (let i = startFrom; i < arrayString.length; i++) {
    const char2 = arrayString[i];
    if (char2 === "\\") {
      i++;
      continue;
    }
    if (char2 === '"') {
      return [arrayString.slice(startFrom, i).replace(/\\/g, ""), i + 1];
    }
    if (inQuotes) {
      continue;
    }
    if (char2 === "," || char2 === "}") {
      return [arrayString.slice(startFrom, i).replace(/\\/g, ""), i];
    }
  }
  return [arrayString.slice(startFrom).replace(/\\/g, ""), arrayString.length];
}
function parsePgNestedArray(arrayString, startFrom = 0) {
  const result = [];
  let i = startFrom;
  let lastCharIsComma = false;
  while (i < arrayString.length) {
    const char2 = arrayString[i];
    if (char2 === ",") {
      if (lastCharIsComma || i === startFrom) {
        result.push("");
      }
      lastCharIsComma = true;
      i++;
      continue;
    }
    lastCharIsComma = false;
    if (char2 === "\\") {
      i += 2;
      continue;
    }
    if (char2 === '"') {
      const [value2, startFrom2] = parsePgArrayValue(arrayString, i + 1, true);
      result.push(value2);
      i = startFrom2;
      continue;
    }
    if (char2 === "}") {
      return [result, i + 1];
    }
    if (char2 === "{") {
      const [value2, startFrom2] = parsePgNestedArray(arrayString, i + 1);
      result.push(value2);
      i = startFrom2;
      continue;
    }
    const [value, newStartFrom] = parsePgArrayValue(arrayString, i, false);
    result.push(value);
    i = newStartFrom;
  }
  return [result, i];
}
function parsePgArray(arrayString) {
  const [result] = parsePgNestedArray(arrayString, 1);
  return result;
}
function makePgArray(array) {
  return `{${array.map((item) => {
    if (Array.isArray(item)) {
      return makePgArray(item);
    }
    if (typeof item === "string") {
      return `"${item.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
    }
    return `${item}`;
  }).join(",")}}`;
}

// node_modules/drizzle-orm/tracing-utils.js
function iife(fn, ...args) {
  return fn(...args);
}

// node_modules/drizzle-orm/pg-core/columns/common.js
var _a8, _b;
var PgColumnBuilder = class extends (_b = ColumnBuilder, _a8 = entityKind, _b) {
  constructor() {
    super(...arguments);
    __publicField(this, "foreignKeyConfigs", []);
  }
  array(size) {
    return new PgArrayBuilder(this.config.name, this, size);
  }
  references(ref, actions = {}) {
    this.foreignKeyConfigs.push({ ref, actions });
    return this;
  }
  unique(name2, config) {
    this.config.isUnique = true;
    this.config.uniqueName = name2;
    this.config.uniqueType = config == null ? void 0 : config.nulls;
    return this;
  }
  generatedAlwaysAs(as) {
    this.config.generated = {
      as,
      type: "always",
      mode: "stored"
    };
    return this;
  }
  /** @internal */
  buildForeignKeys(column, table) {
    return this.foreignKeyConfigs.map(({ ref, actions }) => {
      return iife(
        (ref2, actions2) => {
          const builder = new ForeignKeyBuilder(() => {
            const foreignColumn = ref2();
            return { columns: [column], foreignColumns: [foreignColumn] };
          });
          if (actions2.onUpdate) {
            builder.onUpdate(actions2.onUpdate);
          }
          if (actions2.onDelete) {
            builder.onDelete(actions2.onDelete);
          }
          return builder.build(table);
        },
        ref,
        actions
      );
    });
  }
  /** @internal */
  buildExtraConfigColumn(table) {
    return new ExtraConfigColumn(table, this.config);
  }
};
__publicField(PgColumnBuilder, _a8, "PgColumnBuilder");
var _a9, _b2;
var PgColumn = class extends (_b2 = Column, _a9 = entityKind, _b2) {
  constructor(table, config) {
    if (!config.uniqueName) {
      config.uniqueName = uniqueKeyName(table, [config.name]);
    }
    super(table, config);
    this.table = table;
  }
};
__publicField(PgColumn, _a9, "PgColumn");
var _a10, _b3;
var ExtraConfigColumn = class extends (_b3 = PgColumn, _a10 = entityKind, _b3) {
  constructor() {
    super(...arguments);
    __publicField(this, "indexConfig", {
      order: this.config.order ?? "asc",
      nulls: this.config.nulls ?? "last",
      opClass: this.config.opClass
    });
    __publicField(this, "defaultConfig", {
      order: "asc",
      nulls: "last",
      opClass: void 0
    });
  }
  getSQLType() {
    return this.getSQLType();
  }
  asc() {
    this.indexConfig.order = "asc";
    return this;
  }
  desc() {
    this.indexConfig.order = "desc";
    return this;
  }
  nullsFirst() {
    this.indexConfig.nulls = "first";
    return this;
  }
  nullsLast() {
    this.indexConfig.nulls = "last";
    return this;
  }
  /**
   * ### PostgreSQL documentation quote
   *
   * > An operator class with optional parameters can be specified for each column of an index.
   * The operator class identifies the operators to be used by the index for that column.
   * For example, a B-tree index on four-byte integers would use the int4_ops class;
   * this operator class includes comparison functions for four-byte integers.
   * In practice the default operator class for the column's data type is usually sufficient.
   * The main point of having operator classes is that for some data types, there could be more than one meaningful ordering.
   * For example, we might want to sort a complex-number data type either by absolute value or by real part.
   * We could do this by defining two operator classes for the data type and then selecting the proper class when creating an index.
   * More information about operator classes check:
   *
   * ### Useful links
   * https://www.postgresql.org/docs/current/sql-createindex.html
   *
   * https://www.postgresql.org/docs/current/indexes-opclass.html
   *
   * https://www.postgresql.org/docs/current/xindex.html
   *
   * ### Additional types
   * If you have the `pg_vector` extension installed in your database, you can use the
   * `vector_l2_ops`, `vector_ip_ops`, `vector_cosine_ops`, `vector_l1_ops`, `bit_hamming_ops`, `bit_jaccard_ops`, `halfvec_l2_ops`, `sparsevec_l2_ops` options, which are predefined types.
   *
   * **You can always specify any string you want in the operator class, in case Drizzle doesn't have it natively in its types**
   *
   * @param opClass
   * @returns
   */
  op(opClass) {
    this.indexConfig.opClass = opClass;
    return this;
  }
};
__publicField(ExtraConfigColumn, _a10, "ExtraConfigColumn");
var _a11;
_a11 = entityKind;
var IndexedColumn = class {
  constructor(name2, keyAsName, type, indexConfig) {
    __publicField(this, "name");
    __publicField(this, "keyAsName");
    __publicField(this, "type");
    __publicField(this, "indexConfig");
    this.name = name2;
    this.keyAsName = keyAsName;
    this.type = type;
    this.indexConfig = indexConfig;
  }
};
__publicField(IndexedColumn, _a11, "IndexedColumn");
var _a12, _b4;
var PgArrayBuilder = class extends (_b4 = PgColumnBuilder, _a12 = entityKind, _b4) {
  constructor(name2, baseBuilder, size) {
    super(name2, "array", "PgArray");
    this.config.baseBuilder = baseBuilder;
    this.config.size = size;
  }
  /** @internal */
  build(table) {
    const baseColumn = this.config.baseBuilder.build(table);
    return new PgArray(
      table,
      this.config,
      baseColumn
    );
  }
};
__publicField(PgArrayBuilder, _a12, "PgArrayBuilder");
var _a13, _b5;
var _PgArray = class _PgArray extends (_b5 = PgColumn, _a13 = entityKind, _b5) {
  constructor(table, config, baseColumn, range) {
    super(table, config);
    __publicField(this, "size");
    this.baseColumn = baseColumn;
    this.range = range;
    this.size = config.size;
  }
  getSQLType() {
    return `${this.baseColumn.getSQLType()}[${typeof this.size === "number" ? this.size : ""}]`;
  }
  mapFromDriverValue(value) {
    if (typeof value === "string") {
      value = parsePgArray(value);
    }
    return value.map((v) => this.baseColumn.mapFromDriverValue(v));
  }
  mapToDriverValue(value, isNestedArray = false) {
    const a = value.map(
      (v) => v === null ? null : is(this.baseColumn, _PgArray) ? this.baseColumn.mapToDriverValue(v, true) : this.baseColumn.mapToDriverValue(v)
    );
    if (isNestedArray)
      return a;
    return makePgArray(a);
  }
};
__publicField(_PgArray, _a13, "PgArray");
var PgArray = _PgArray;

// node_modules/drizzle-orm/pg-core/columns/enum.js
var isPgEnumSym = Symbol.for("drizzle:isPgEnum");
function isPgEnum(obj) {
  return !!obj && typeof obj === "function" && isPgEnumSym in obj && obj[isPgEnumSym] === true;
}
var _a14, _b6;
var PgEnumColumnBuilder = class extends (_b6 = PgColumnBuilder, _a14 = entityKind, _b6) {
  constructor(name2, enumInstance) {
    super(name2, "string", "PgEnumColumn");
    this.config.enum = enumInstance;
  }
  /** @internal */
  build(table) {
    return new PgEnumColumn(
      table,
      this.config
    );
  }
};
__publicField(PgEnumColumnBuilder, _a14, "PgEnumColumnBuilder");
var _a15, _b7;
var PgEnumColumn = class extends (_b7 = PgColumn, _a15 = entityKind, _b7) {
  constructor(table, config) {
    super(table, config);
    __publicField(this, "enum", this.config.enum);
    __publicField(this, "enumValues", this.config.enum.enumValues);
    this.enum = config.enum;
  }
  getSQLType() {
    return this.enum.enumName;
  }
};
__publicField(PgEnumColumn, _a15, "PgEnumColumn");
function pgEnum(enumName, values) {
  return pgEnumWithSchema(enumName, values, void 0);
}
function pgEnumWithSchema(enumName, values, schema) {
  const enumInstance = Object.assign(
    (name2) => new PgEnumColumnBuilder(name2 ?? "", enumInstance),
    {
      enumName,
      enumValues: values,
      schema,
      [isPgEnumSym]: true
    }
  );
  return enumInstance;
}

// node_modules/drizzle-orm/subquery.js
var _a16;
_a16 = entityKind;
var Subquery = class {
  constructor(sql2, selection, alias, isWith = false) {
    this._ = {
      brand: "Subquery",
      sql: sql2,
      selectedFields: selection,
      alias,
      isWith
    };
  }
  // getSQL(): SQL<unknown> {
  // 	return new SQL([this]);
  // }
};
__publicField(Subquery, _a16, "Subquery");
var _a17, _b8;
var WithSubquery = class extends (_b8 = Subquery, _a17 = entityKind, _b8) {
};
__publicField(WithSubquery, _a17, "WithSubquery");

// node_modules/drizzle-orm/view-common.js
var ViewBaseConfig = Symbol.for("drizzle:ViewBaseConfig");

// node_modules/drizzle-orm/table.js
var Schema = Symbol.for("drizzle:Schema");
var Columns = Symbol.for("drizzle:Columns");
var ExtraConfigColumns = Symbol.for("drizzle:ExtraConfigColumns");
var OriginalName = Symbol.for("drizzle:OriginalName");
var BaseName = Symbol.for("drizzle:BaseName");
var IsAlias = Symbol.for("drizzle:IsAlias");
var ExtraConfigBuilder = Symbol.for("drizzle:ExtraConfigBuilder");
var IsDrizzleTable = Symbol.for("drizzle:IsDrizzleTable");
var _a18, _b9, _c, _d, _e, _f, _g, _h, _i, _j;
_j = entityKind, _i = TableName, _h = OriginalName, _g = Schema, _f = Columns, _e = ExtraConfigColumns, _d = BaseName, _c = IsAlias, _b9 = IsDrizzleTable, _a18 = ExtraConfigBuilder;
var Table = class {
  constructor(name2, schema, baseName) {
    /**
     * @internal
     * Can be changed if the table is aliased.
     */
    __publicField(this, _i);
    /**
     * @internal
     * Used to store the original name of the table, before any aliasing.
     */
    __publicField(this, _h);
    /** @internal */
    __publicField(this, _g);
    /** @internal */
    __publicField(this, _f);
    /** @internal */
    __publicField(this, _e);
    /**
     *  @internal
     * Used to store the table name before the transformation via the `tableCreator` functions.
     */
    __publicField(this, _d);
    /** @internal */
    __publicField(this, _c, false);
    /** @internal */
    __publicField(this, _b9, true);
    /** @internal */
    __publicField(this, _a18);
    this[TableName] = this[OriginalName] = name2;
    this[Schema] = schema;
    this[BaseName] = baseName;
  }
};
__publicField(Table, _j, "Table");
/** @internal */
__publicField(Table, "Symbol", {
  Name: TableName,
  Schema,
  OriginalName,
  Columns,
  ExtraConfigColumns,
  BaseName,
  IsAlias,
  ExtraConfigBuilder
});
function isTable(table) {
  return typeof table === "object" && table !== null && IsDrizzleTable in table;
}
function getTableName(table) {
  return table[TableName];
}
function getTableUniqueName(table) {
  return `${table[Schema] ?? "public"}.${table[TableName]}`;
}

// node_modules/drizzle-orm/version.js
var version = "0.39.3";

// node_modules/drizzle-orm/tracing.js
var otel;
var rawTracer;
var tracer = {
  startActiveSpan(name2, fn) {
    if (!otel) {
      return fn();
    }
    if (!rawTracer) {
      rawTracer = otel.trace.getTracer("drizzle-orm", version);
    }
    return iife(
      (otel2, rawTracer2) => rawTracer2.startActiveSpan(
        name2,
        (span) => {
          try {
            return fn(span);
          } catch (e) {
            span.setStatus({
              code: otel2.SpanStatusCode.ERROR,
              message: e instanceof Error ? e.message : "Unknown error"
              // eslint-disable-line no-instanceof/no-instanceof
            });
            throw e;
          } finally {
            span.end();
          }
        }
      ),
      otel,
      rawTracer
    );
  }
};

// node_modules/drizzle-orm/sql/sql.js
var _a19;
_a19 = entityKind;
var FakePrimitiveParam = class {
};
__publicField(FakePrimitiveParam, _a19, "FakePrimitiveParam");
function isSQLWrapper(value) {
  return value !== null && value !== void 0 && typeof value.getSQL === "function";
}
function mergeQueries(queries) {
  var _a119;
  const result = { sql: "", params: [] };
  for (const query of queries) {
    result.sql += query.sql;
    result.params.push(...query.params);
    if ((_a119 = query.typings) == null ? void 0 : _a119.length) {
      if (!result.typings) {
        result.typings = [];
      }
      result.typings.push(...query.typings);
    }
  }
  return result;
}
var _a20;
_a20 = entityKind;
var StringChunk = class {
  constructor(value) {
    __publicField(this, "value");
    this.value = Array.isArray(value) ? value : [value];
  }
  getSQL() {
    return new SQL([this]);
  }
};
__publicField(StringChunk, _a20, "StringChunk");
var _a21;
_a21 = entityKind;
var _SQL = class _SQL {
  constructor(queryChunks) {
    /** @internal */
    __publicField(this, "decoder", noopDecoder);
    __publicField(this, "shouldInlineParams", false);
    this.queryChunks = queryChunks;
  }
  append(query) {
    this.queryChunks.push(...query.queryChunks);
    return this;
  }
  toQuery(config) {
    return tracer.startActiveSpan("drizzle.buildSQL", (span) => {
      const query = this.buildQueryFromSourceParams(this.queryChunks, config);
      span == null ? void 0 : span.setAttributes({
        "drizzle.query.text": query.sql,
        "drizzle.query.params": JSON.stringify(query.params)
      });
      return query;
    });
  }
  buildQueryFromSourceParams(chunks, _config) {
    const config = Object.assign({}, _config, {
      inlineParams: _config.inlineParams || this.shouldInlineParams,
      paramStartIndex: _config.paramStartIndex || { value: 0 }
    });
    const {
      casing,
      escapeName,
      escapeParam,
      prepareTyping,
      inlineParams,
      paramStartIndex
    } = config;
    return mergeQueries(chunks.map((chunk) => {
      var _a119;
      if (is(chunk, StringChunk)) {
        return { sql: chunk.value.join(""), params: [] };
      }
      if (is(chunk, Name)) {
        return { sql: escapeName(chunk.value), params: [] };
      }
      if (chunk === void 0) {
        return { sql: "", params: [] };
      }
      if (Array.isArray(chunk)) {
        const result = [new StringChunk("(")];
        for (const [i, p] of chunk.entries()) {
          result.push(p);
          if (i < chunk.length - 1) {
            result.push(new StringChunk(", "));
          }
        }
        result.push(new StringChunk(")"));
        return this.buildQueryFromSourceParams(result, config);
      }
      if (is(chunk, _SQL)) {
        return this.buildQueryFromSourceParams(chunk.queryChunks, {
          ...config,
          inlineParams: inlineParams || chunk.shouldInlineParams
        });
      }
      if (is(chunk, Table)) {
        const schemaName = chunk[Table.Symbol.Schema];
        const tableName = chunk[Table.Symbol.Name];
        return {
          sql: schemaName === void 0 || chunk[IsAlias] ? escapeName(tableName) : escapeName(schemaName) + "." + escapeName(tableName),
          params: []
        };
      }
      if (is(chunk, Column)) {
        const columnName = casing.getColumnCasing(chunk);
        if (_config.invokeSource === "indexes") {
          return { sql: escapeName(columnName), params: [] };
        }
        const schemaName = chunk.table[Table.Symbol.Schema];
        return {
          sql: chunk.table[IsAlias] || schemaName === void 0 ? escapeName(chunk.table[Table.Symbol.Name]) + "." + escapeName(columnName) : escapeName(schemaName) + "." + escapeName(chunk.table[Table.Symbol.Name]) + "." + escapeName(columnName),
          params: []
        };
      }
      if (is(chunk, View)) {
        const schemaName = chunk[ViewBaseConfig].schema;
        const viewName = chunk[ViewBaseConfig].name;
        return {
          sql: schemaName === void 0 || chunk[ViewBaseConfig].isAlias ? escapeName(viewName) : escapeName(schemaName) + "." + escapeName(viewName),
          params: []
        };
      }
      if (is(chunk, Param)) {
        if (is(chunk.value, Placeholder)) {
          return { sql: escapeParam(paramStartIndex.value++, chunk), params: [chunk], typings: ["none"] };
        }
        const mappedValue = chunk.value === null ? null : chunk.encoder.mapToDriverValue(chunk.value);
        if (is(mappedValue, _SQL)) {
          return this.buildQueryFromSourceParams([mappedValue], config);
        }
        if (inlineParams) {
          return { sql: this.mapInlineParam(mappedValue, config), params: [] };
        }
        let typings = ["none"];
        if (prepareTyping) {
          typings = [prepareTyping(chunk.encoder)];
        }
        return { sql: escapeParam(paramStartIndex.value++, mappedValue), params: [mappedValue], typings };
      }
      if (is(chunk, Placeholder)) {
        return { sql: escapeParam(paramStartIndex.value++, chunk), params: [chunk], typings: ["none"] };
      }
      if (is(chunk, _SQL.Aliased) && chunk.fieldAlias !== void 0) {
        return { sql: escapeName(chunk.fieldAlias), params: [] };
      }
      if (is(chunk, Subquery)) {
        if (chunk._.isWith) {
          return { sql: escapeName(chunk._.alias), params: [] };
        }
        return this.buildQueryFromSourceParams([
          new StringChunk("("),
          chunk._.sql,
          new StringChunk(") "),
          new Name(chunk._.alias)
        ], config);
      }
      if (isPgEnum(chunk)) {
        if (chunk.schema) {
          return { sql: escapeName(chunk.schema) + "." + escapeName(chunk.enumName), params: [] };
        }
        return { sql: escapeName(chunk.enumName), params: [] };
      }
      if (isSQLWrapper(chunk)) {
        if ((_a119 = chunk.shouldOmitSQLParens) == null ? void 0 : _a119.call(chunk)) {
          return this.buildQueryFromSourceParams([chunk.getSQL()], config);
        }
        return this.buildQueryFromSourceParams([
          new StringChunk("("),
          chunk.getSQL(),
          new StringChunk(")")
        ], config);
      }
      if (inlineParams) {
        return { sql: this.mapInlineParam(chunk, config), params: [] };
      }
      return { sql: escapeParam(paramStartIndex.value++, chunk), params: [chunk], typings: ["none"] };
    }));
  }
  mapInlineParam(chunk, { escapeString }) {
    if (chunk === null) {
      return "null";
    }
    if (typeof chunk === "number" || typeof chunk === "boolean") {
      return chunk.toString();
    }
    if (typeof chunk === "string") {
      return escapeString(chunk);
    }
    if (typeof chunk === "object") {
      const mappedValueAsString = chunk.toString();
      if (mappedValueAsString === "[object Object]") {
        return escapeString(JSON.stringify(chunk));
      }
      return escapeString(mappedValueAsString);
    }
    throw new Error("Unexpected param value: " + chunk);
  }
  getSQL() {
    return this;
  }
  as(alias) {
    if (alias === void 0) {
      return this;
    }
    return new _SQL.Aliased(this, alias);
  }
  mapWith(decoder) {
    this.decoder = typeof decoder === "function" ? { mapFromDriverValue: decoder } : decoder;
    return this;
  }
  inlineParams() {
    this.shouldInlineParams = true;
    return this;
  }
  /**
   * This method is used to conditionally include a part of the query.
   *
   * @param condition - Condition to check
   * @returns itself if the condition is `true`, otherwise `undefined`
   */
  if(condition) {
    return condition ? this : void 0;
  }
};
__publicField(_SQL, _a21, "SQL");
var SQL = _SQL;
var _a22;
_a22 = entityKind;
var Name = class {
  constructor(value) {
    __publicField(this, "brand");
    this.value = value;
  }
  getSQL() {
    return new SQL([this]);
  }
};
__publicField(Name, _a22, "Name");
function name(value) {
  return new Name(value);
}
function isDriverValueEncoder(value) {
  return typeof value === "object" && value !== null && "mapToDriverValue" in value && typeof value.mapToDriverValue === "function";
}
var noopDecoder = {
  mapFromDriverValue: (value) => value
};
var noopEncoder = {
  mapToDriverValue: (value) => value
};
var noopMapper = {
  ...noopDecoder,
  ...noopEncoder
};
var _a23;
_a23 = entityKind;
var Param = class {
  /**
   * @param value - Parameter value
   * @param encoder - Encoder to convert the value to a driver parameter
   */
  constructor(value, encoder = noopEncoder) {
    __publicField(this, "brand");
    this.value = value;
    this.encoder = encoder;
  }
  getSQL() {
    return new SQL([this]);
  }
};
__publicField(Param, _a23, "Param");
function param(value, encoder) {
  return new Param(value, encoder);
}
function sql(strings, ...params) {
  const queryChunks = [];
  if (params.length > 0 || strings.length > 0 && strings[0] !== "") {
    queryChunks.push(new StringChunk(strings[0]));
  }
  for (const [paramIndex, param2] of params.entries()) {
    queryChunks.push(param2, new StringChunk(strings[paramIndex + 1]));
  }
  return new SQL(queryChunks);
}
((sql2) => {
  function empty() {
    return new SQL([]);
  }
  sql2.empty = empty;
  function fromList(list) {
    return new SQL(list);
  }
  sql2.fromList = fromList;
  function raw(str) {
    return new SQL([new StringChunk(str)]);
  }
  sql2.raw = raw;
  function join(chunks, separator) {
    const result = [];
    for (const [i, chunk] of chunks.entries()) {
      if (i > 0 && separator !== void 0) {
        result.push(separator);
      }
      result.push(chunk);
    }
    return new SQL(result);
  }
  sql2.join = join;
  function identifier(value) {
    return new Name(value);
  }
  sql2.identifier = identifier;
  function placeholder2(name2) {
    return new Placeholder(name2);
  }
  sql2.placeholder = placeholder2;
  function param2(value, encoder) {
    return new Param(value, encoder);
  }
  sql2.param = param2;
})(sql || (sql = {}));
((SQL2) => {
  var _a119;
  _a119 = entityKind;
  const _Aliased = class _Aliased {
    constructor(sql2, fieldAlias) {
      /** @internal */
      __publicField(this, "isSelectionField", false);
      this.sql = sql2;
      this.fieldAlias = fieldAlias;
    }
    getSQL() {
      return this.sql;
    }
    /** @internal */
    clone() {
      return new _Aliased(this.sql, this.fieldAlias);
    }
  };
  __publicField(_Aliased, _a119, "SQL.Aliased");
  let Aliased = _Aliased;
  SQL2.Aliased = Aliased;
})(SQL || (SQL = {}));
var _a24;
_a24 = entityKind;
var Placeholder = class {
  constructor(name2) {
    this.name = name2;
  }
  getSQL() {
    return new SQL([this]);
  }
};
__publicField(Placeholder, _a24, "Placeholder");
function placeholder(name2) {
  return new Placeholder(name2);
}
function fillPlaceholders(params, values) {
  return params.map((p) => {
    if (is(p, Placeholder)) {
      if (!(p.name in values)) {
        throw new Error(`No value for placeholder "${p.name}" was provided`);
      }
      return values[p.name];
    }
    if (is(p, Param) && is(p.value, Placeholder)) {
      if (!(p.value.name in values)) {
        throw new Error(`No value for placeholder "${p.value.name}" was provided`);
      }
      return p.encoder.mapToDriverValue(values[p.value.name]);
    }
    return p;
  });
}
var IsDrizzleView = Symbol.for("drizzle:IsDrizzleView");
var _a25, _b10, _c2;
_c2 = entityKind, _b10 = ViewBaseConfig, _a25 = IsDrizzleView;
var View = class {
  constructor({ name: name2, schema, selectedFields, query }) {
    /** @internal */
    __publicField(this, _b10);
    /** @internal */
    __publicField(this, _a25, true);
    this[ViewBaseConfig] = {
      name: name2,
      originalName: name2,
      schema,
      selectedFields,
      query,
      isExisting: !query,
      isAlias: false
    };
  }
  getSQL() {
    return new SQL([this]);
  }
};
__publicField(View, _c2, "View");
function isView(view) {
  return typeof view === "object" && view !== null && IsDrizzleView in view;
}
function getViewName(view) {
  return view[ViewBaseConfig].name;
}
Column.prototype.getSQL = function() {
  return new SQL([this]);
};
Table.prototype.getSQL = function() {
  return new SQL([this]);
};
Subquery.prototype.getSQL = function() {
  return new SQL([this]);
};

// node_modules/drizzle-orm/alias.js
var _a26;
_a26 = entityKind;
var ColumnAliasProxyHandler = class {
  constructor(table) {
    this.table = table;
  }
  get(columnObj, prop) {
    if (prop === "table") {
      return this.table;
    }
    return columnObj[prop];
  }
};
__publicField(ColumnAliasProxyHandler, _a26, "ColumnAliasProxyHandler");
var _a27;
_a27 = entityKind;
var TableAliasProxyHandler = class {
  constructor(alias, replaceOriginalName) {
    this.alias = alias;
    this.replaceOriginalName = replaceOriginalName;
  }
  get(target, prop) {
    if (prop === Table.Symbol.IsAlias) {
      return true;
    }
    if (prop === Table.Symbol.Name) {
      return this.alias;
    }
    if (this.replaceOriginalName && prop === Table.Symbol.OriginalName) {
      return this.alias;
    }
    if (prop === ViewBaseConfig) {
      return {
        ...target[ViewBaseConfig],
        name: this.alias,
        isAlias: true
      };
    }
    if (prop === Table.Symbol.Columns) {
      const columns = target[Table.Symbol.Columns];
      if (!columns) {
        return columns;
      }
      const proxiedColumns = {};
      Object.keys(columns).map((key) => {
        proxiedColumns[key] = new Proxy(
          columns[key],
          new ColumnAliasProxyHandler(new Proxy(target, this))
        );
      });
      return proxiedColumns;
    }
    const value = target[prop];
    if (is(value, Column)) {
      return new Proxy(value, new ColumnAliasProxyHandler(new Proxy(target, this)));
    }
    return value;
  }
};
__publicField(TableAliasProxyHandler, _a27, "TableAliasProxyHandler");
var _a28;
_a28 = entityKind;
var RelationTableAliasProxyHandler = class {
  constructor(alias) {
    this.alias = alias;
  }
  get(target, prop) {
    if (prop === "sourceTable") {
      return aliasedTable(target.sourceTable, this.alias);
    }
    return target[prop];
  }
};
__publicField(RelationTableAliasProxyHandler, _a28, "RelationTableAliasProxyHandler");
function aliasedTable(table, tableAlias) {
  return new Proxy(table, new TableAliasProxyHandler(tableAlias, false));
}
function aliasedRelation(relation, tableAlias) {
  return new Proxy(relation, new RelationTableAliasProxyHandler(tableAlias));
}
function aliasedTableColumn(column, tableAlias) {
  return new Proxy(
    column,
    new ColumnAliasProxyHandler(new Proxy(column.table, new TableAliasProxyHandler(tableAlias, false)))
  );
}
function mapColumnsInAliasedSQLToAlias(query, alias) {
  return new SQL.Aliased(mapColumnsInSQLToAlias(query.sql, alias), query.fieldAlias);
}
function mapColumnsInSQLToAlias(query, alias) {
  return sql.join(query.queryChunks.map((c) => {
    if (is(c, Column)) {
      return aliasedTableColumn(c, alias);
    }
    if (is(c, SQL)) {
      return mapColumnsInSQLToAlias(c, alias);
    }
    if (is(c, SQL.Aliased)) {
      return mapColumnsInAliasedSQLToAlias(c, alias);
    }
    return c;
  }));
}

// node_modules/drizzle-orm/errors.js
var _a29, _b11;
var DrizzleError = class extends (_b11 = Error, _a29 = entityKind, _b11) {
  constructor({ message, cause }) {
    super(message);
    this.name = "DrizzleError";
    this.cause = cause;
  }
};
__publicField(DrizzleError, _a29, "DrizzleError");
var _a30, _b12;
var TransactionRollbackError = class extends (_b12 = DrizzleError, _a30 = entityKind, _b12) {
  constructor() {
    super({ message: "Rollback" });
  }
};
__publicField(TransactionRollbackError, _a30, "TransactionRollbackError");

// node_modules/drizzle-orm/sql/expressions/conditions.js
function bindIfParam(value, column) {
  if (isDriverValueEncoder(column) && !isSQLWrapper(value) && !is(value, Param) && !is(value, Placeholder) && !is(value, Column) && !is(value, Table) && !is(value, View)) {
    return new Param(value, column);
  }
  return value;
}
var eq = (left, right) => {
  return sql`${left} = ${bindIfParam(right, left)}`;
};
var ne = (left, right) => {
  return sql`${left} <> ${bindIfParam(right, left)}`;
};
function and(...unfilteredConditions) {
  const conditions = unfilteredConditions.filter(
    (c) => c !== void 0
  );
  if (conditions.length === 0) {
    return void 0;
  }
  if (conditions.length === 1) {
    return new SQL(conditions);
  }
  return new SQL([
    new StringChunk("("),
    sql.join(conditions, new StringChunk(" and ")),
    new StringChunk(")")
  ]);
}
function or(...unfilteredConditions) {
  const conditions = unfilteredConditions.filter(
    (c) => c !== void 0
  );
  if (conditions.length === 0) {
    return void 0;
  }
  if (conditions.length === 1) {
    return new SQL(conditions);
  }
  return new SQL([
    new StringChunk("("),
    sql.join(conditions, new StringChunk(" or ")),
    new StringChunk(")")
  ]);
}
function not(condition) {
  return sql`not ${condition}`;
}
var gt = (left, right) => {
  return sql`${left} > ${bindIfParam(right, left)}`;
};
var gte = (left, right) => {
  return sql`${left} >= ${bindIfParam(right, left)}`;
};
var lt = (left, right) => {
  return sql`${left} < ${bindIfParam(right, left)}`;
};
var lte = (left, right) => {
  return sql`${left} <= ${bindIfParam(right, left)}`;
};
function inArray(column, values) {
  if (Array.isArray(values)) {
    if (values.length === 0) {
      return sql`false`;
    }
    return sql`${column} in ${values.map((v) => bindIfParam(v, column))}`;
  }
  return sql`${column} in ${bindIfParam(values, column)}`;
}
function notInArray(column, values) {
  if (Array.isArray(values)) {
    if (values.length === 0) {
      return sql`true`;
    }
    return sql`${column} not in ${values.map((v) => bindIfParam(v, column))}`;
  }
  return sql`${column} not in ${bindIfParam(values, column)}`;
}
function isNull(value) {
  return sql`${value} is null`;
}
function isNotNull(value) {
  return sql`${value} is not null`;
}
function exists(subquery) {
  return sql`exists ${subquery}`;
}
function notExists(subquery) {
  return sql`not exists ${subquery}`;
}
function between(column, min2, max2) {
  return sql`${column} between ${bindIfParam(min2, column)} and ${bindIfParam(
    max2,
    column
  )}`;
}
function notBetween(column, min2, max2) {
  return sql`${column} not between ${bindIfParam(
    min2,
    column
  )} and ${bindIfParam(max2, column)}`;
}
function like(column, value) {
  return sql`${column} like ${value}`;
}
function notLike(column, value) {
  return sql`${column} not like ${value}`;
}
function ilike(column, value) {
  return sql`${column} ilike ${value}`;
}
function notIlike(column, value) {
  return sql`${column} not ilike ${value}`;
}
function arrayContains(column, values) {
  if (Array.isArray(values)) {
    if (values.length === 0) {
      throw new Error("arrayContains requires at least one value");
    }
    const array = sql`${bindIfParam(values, column)}`;
    return sql`${column} @> ${array}`;
  }
  return sql`${column} @> ${bindIfParam(values, column)}`;
}
function arrayContained(column, values) {
  if (Array.isArray(values)) {
    if (values.length === 0) {
      throw new Error("arrayContained requires at least one value");
    }
    const array = sql`${bindIfParam(values, column)}`;
    return sql`${column} <@ ${array}`;
  }
  return sql`${column} <@ ${bindIfParam(values, column)}`;
}
function arrayOverlaps(column, values) {
  if (Array.isArray(values)) {
    if (values.length === 0) {
      throw new Error("arrayOverlaps requires at least one value");
    }
    const array = sql`${bindIfParam(values, column)}`;
    return sql`${column} && ${array}`;
  }
  return sql`${column} && ${bindIfParam(values, column)}`;
}

// node_modules/drizzle-orm/sql/expressions/select.js
function asc(column) {
  return sql`${column} asc`;
}
function desc(column) {
  return sql`${column} desc`;
}

// node_modules/drizzle-orm/query-promise.js
var _a31, _b13;
_b13 = entityKind, _a31 = Symbol.toStringTag;
var QueryPromise = class {
  constructor() {
    __publicField(this, _a31, "QueryPromise");
  }
  catch(onRejected) {
    return this.then(void 0, onRejected);
  }
  finally(onFinally) {
    return this.then(
      (value) => {
        onFinally == null ? void 0 : onFinally();
        return value;
      },
      (reason) => {
        onFinally == null ? void 0 : onFinally();
        throw reason;
      }
    );
  }
  then(onFulfilled, onRejected) {
    return this.execute().then(onFulfilled, onRejected);
  }
};
__publicField(QueryPromise, _b13, "QueryPromise");

// node_modules/drizzle-orm/utils.js
function mapResultRow(columns, row, joinsNotNullableMap) {
  const nullifyMap = {};
  const result = columns.reduce(
    (result2, { path, field }, columnIndex) => {
      let decoder;
      if (is(field, Column)) {
        decoder = field;
      } else if (is(field, SQL)) {
        decoder = field.decoder;
      } else {
        decoder = field.sql.decoder;
      }
      let node = result2;
      for (const [pathChunkIndex, pathChunk] of path.entries()) {
        if (pathChunkIndex < path.length - 1) {
          if (!(pathChunk in node)) {
            node[pathChunk] = {};
          }
          node = node[pathChunk];
        } else {
          const rawValue = row[columnIndex];
          const value = node[pathChunk] = rawValue === null ? null : decoder.mapFromDriverValue(rawValue);
          if (joinsNotNullableMap && is(field, Column) && path.length === 2) {
            const objectName = path[0];
            if (!(objectName in nullifyMap)) {
              nullifyMap[objectName] = value === null ? getTableName(field.table) : false;
            } else if (typeof nullifyMap[objectName] === "string" && nullifyMap[objectName] !== getTableName(field.table)) {
              nullifyMap[objectName] = false;
            }
          }
        }
      }
      return result2;
    },
    {}
  );
  if (joinsNotNullableMap && Object.keys(nullifyMap).length > 0) {
    for (const [objectName, tableName] of Object.entries(nullifyMap)) {
      if (typeof tableName === "string" && !joinsNotNullableMap[tableName]) {
        result[objectName] = null;
      }
    }
  }
  return result;
}
function orderSelectedFields(fields, pathPrefix) {
  return Object.entries(fields).reduce((result, [name2, field]) => {
    if (typeof name2 !== "string") {
      return result;
    }
    const newPath = pathPrefix ? [...pathPrefix, name2] : [name2];
    if (is(field, Column) || is(field, SQL) || is(field, SQL.Aliased)) {
      result.push({ path: newPath, field });
    } else if (is(field, Table)) {
      result.push(...orderSelectedFields(field[Table.Symbol.Columns], newPath));
    } else {
      result.push(...orderSelectedFields(field, newPath));
    }
    return result;
  }, []);
}
function haveSameKeys(left, right) {
  const leftKeys = Object.keys(left);
  const rightKeys = Object.keys(right);
  if (leftKeys.length !== rightKeys.length) {
    return false;
  }
  for (const [index, key] of leftKeys.entries()) {
    if (key !== rightKeys[index]) {
      return false;
    }
  }
  return true;
}
function mapUpdateSet(table, values) {
  const entries = Object.entries(values).filter(([, value]) => value !== void 0).map(([key, value]) => {
    if (is(value, SQL) || is(value, Column)) {
      return [key, value];
    } else {
      return [key, new Param(value, table[Table.Symbol.Columns][key])];
    }
  });
  if (entries.length === 0) {
    throw new Error("No values to set");
  }
  return Object.fromEntries(entries);
}
function applyMixins(baseClass, extendedClasses) {
  for (const extendedClass of extendedClasses) {
    for (const name2 of Object.getOwnPropertyNames(extendedClass.prototype)) {
      if (name2 === "constructor")
        continue;
      Object.defineProperty(
        baseClass.prototype,
        name2,
        Object.getOwnPropertyDescriptor(extendedClass.prototype, name2) || /* @__PURE__ */ Object.create(null)
      );
    }
  }
}
function getTableColumns(table) {
  return table[Table.Symbol.Columns];
}
function getViewSelectedFields(view) {
  return view[ViewBaseConfig].selectedFields;
}
function getTableLikeName(table) {
  return is(table, Subquery) ? table._.alias : is(table, View) ? table[ViewBaseConfig].name : is(table, SQL) ? void 0 : table[Table.Symbol.IsAlias] ? table[Table.Symbol.Name] : table[Table.Symbol.BaseName];
}
function getColumnNameAndConfig(a, b) {
  return {
    name: typeof a === "string" && a.length > 0 ? a : "",
    config: typeof a === "object" ? a : b
  };
}
function isConfig(data) {
  if (typeof data !== "object" || data === null)
    return false;
  if (data.constructor.name !== "Object")
    return false;
  if ("logger" in data) {
    const type = typeof data["logger"];
    if (type !== "boolean" && (type !== "object" || typeof data["logger"]["logQuery"] !== "function") && type !== "undefined")
      return false;
    return true;
  }
  if ("schema" in data) {
    const type = typeof data["logger"];
    if (type !== "object" && type !== "undefined")
      return false;
    return true;
  }
  if ("casing" in data) {
    const type = typeof data["logger"];
    if (type !== "string" && type !== "undefined")
      return false;
    return true;
  }
  if ("mode" in data) {
    if (data["mode"] !== "default" || data["mode"] !== "planetscale" || data["mode"] !== void 0)
      return false;
    return true;
  }
  if ("connection" in data) {
    const type = typeof data["connection"];
    if (type !== "string" && type !== "object" && type !== "undefined")
      return false;
    return true;
  }
  if ("client" in data) {
    const type = typeof data["client"];
    if (type !== "object" && type !== "function" && type !== "undefined")
      return false;
    return true;
  }
  if (Object.keys(data).length === 0)
    return true;
  return false;
}

// node_modules/drizzle-orm/pg-core/columns/int.common.js
var _a32, _b14;
var PgIntColumnBaseBuilder = class extends (_b14 = PgColumnBuilder, _a32 = entityKind, _b14) {
  generatedAlwaysAsIdentity(sequence) {
    if (sequence) {
      const { name: name2, ...options } = sequence;
      this.config.generatedIdentity = {
        type: "always",
        sequenceName: name2,
        sequenceOptions: options
      };
    } else {
      this.config.generatedIdentity = {
        type: "always"
      };
    }
    this.config.hasDefault = true;
    this.config.notNull = true;
    return this;
  }
  generatedByDefaultAsIdentity(sequence) {
    if (sequence) {
      const { name: name2, ...options } = sequence;
      this.config.generatedIdentity = {
        type: "byDefault",
        sequenceName: name2,
        sequenceOptions: options
      };
    } else {
      this.config.generatedIdentity = {
        type: "byDefault"
      };
    }
    this.config.hasDefault = true;
    this.config.notNull = true;
    return this;
  }
};
__publicField(PgIntColumnBaseBuilder, _a32, "PgIntColumnBaseBuilder");

// node_modules/drizzle-orm/pg-core/columns/bigint.js
var _a33, _b15;
var PgBigInt53Builder = class extends (_b15 = PgIntColumnBaseBuilder, _a33 = entityKind, _b15) {
  constructor(name2) {
    super(name2, "number", "PgBigInt53");
  }
  /** @internal */
  build(table) {
    return new PgBigInt53(table, this.config);
  }
};
__publicField(PgBigInt53Builder, _a33, "PgBigInt53Builder");
var _a34, _b16;
var PgBigInt53 = class extends (_b16 = PgColumn, _a34 = entityKind, _b16) {
  getSQLType() {
    return "bigint";
  }
  mapFromDriverValue(value) {
    if (typeof value === "number") {
      return value;
    }
    return Number(value);
  }
};
__publicField(PgBigInt53, _a34, "PgBigInt53");
var _a35, _b17;
var PgBigInt64Builder = class extends (_b17 = PgIntColumnBaseBuilder, _a35 = entityKind, _b17) {
  constructor(name2) {
    super(name2, "bigint", "PgBigInt64");
  }
  /** @internal */
  build(table) {
    return new PgBigInt64(
      table,
      this.config
    );
  }
};
__publicField(PgBigInt64Builder, _a35, "PgBigInt64Builder");
var _a36, _b18;
var PgBigInt64 = class extends (_b18 = PgColumn, _a36 = entityKind, _b18) {
  getSQLType() {
    return "bigint";
  }
  // eslint-disable-next-line unicorn/prefer-native-coercion-functions
  mapFromDriverValue(value) {
    return BigInt(value);
  }
};
__publicField(PgBigInt64, _a36, "PgBigInt64");
function bigint(a, b) {
  const { name: name2, config } = getColumnNameAndConfig(a, b);
  if (config.mode === "number") {
    return new PgBigInt53Builder(name2);
  }
  return new PgBigInt64Builder(name2);
}

// node_modules/drizzle-orm/pg-core/columns/bigserial.js
var _a37, _b19;
var PgBigSerial53Builder = class extends (_b19 = PgColumnBuilder, _a37 = entityKind, _b19) {
  constructor(name2) {
    super(name2, "number", "PgBigSerial53");
    this.config.hasDefault = true;
    this.config.notNull = true;
  }
  /** @internal */
  build(table) {
    return new PgBigSerial53(
      table,
      this.config
    );
  }
};
__publicField(PgBigSerial53Builder, _a37, "PgBigSerial53Builder");
var _a38, _b20;
var PgBigSerial53 = class extends (_b20 = PgColumn, _a38 = entityKind, _b20) {
  getSQLType() {
    return "bigserial";
  }
  mapFromDriverValue(value) {
    if (typeof value === "number") {
      return value;
    }
    return Number(value);
  }
};
__publicField(PgBigSerial53, _a38, "PgBigSerial53");
var _a39, _b21;
var PgBigSerial64Builder = class extends (_b21 = PgColumnBuilder, _a39 = entityKind, _b21) {
  constructor(name2) {
    super(name2, "bigint", "PgBigSerial64");
    this.config.hasDefault = true;
  }
  /** @internal */
  build(table) {
    return new PgBigSerial64(
      table,
      this.config
    );
  }
};
__publicField(PgBigSerial64Builder, _a39, "PgBigSerial64Builder");
var _a40, _b22;
var PgBigSerial64 = class extends (_b22 = PgColumn, _a40 = entityKind, _b22) {
  getSQLType() {
    return "bigserial";
  }
  // eslint-disable-next-line unicorn/prefer-native-coercion-functions
  mapFromDriverValue(value) {
    return BigInt(value);
  }
};
__publicField(PgBigSerial64, _a40, "PgBigSerial64");
function bigserial(a, b) {
  const { name: name2, config } = getColumnNameAndConfig(a, b);
  if (config.mode === "number") {
    return new PgBigSerial53Builder(name2);
  }
  return new PgBigSerial64Builder(name2);
}

// node_modules/drizzle-orm/pg-core/columns/boolean.js
var _a41, _b23;
var PgBooleanBuilder = class extends (_b23 = PgColumnBuilder, _a41 = entityKind, _b23) {
  constructor(name2) {
    super(name2, "boolean", "PgBoolean");
  }
  /** @internal */
  build(table) {
    return new PgBoolean(table, this.config);
  }
};
__publicField(PgBooleanBuilder, _a41, "PgBooleanBuilder");
var _a42, _b24;
var PgBoolean = class extends (_b24 = PgColumn, _a42 = entityKind, _b24) {
  getSQLType() {
    return "boolean";
  }
};
__publicField(PgBoolean, _a42, "PgBoolean");
function boolean(name2) {
  return new PgBooleanBuilder(name2 ?? "");
}

// node_modules/drizzle-orm/pg-core/columns/char.js
var _a43, _b25;
var PgCharBuilder = class extends (_b25 = PgColumnBuilder, _a43 = entityKind, _b25) {
  constructor(name2, config) {
    super(name2, "string", "PgChar");
    this.config.length = config.length;
    this.config.enumValues = config.enum;
  }
  /** @internal */
  build(table) {
    return new PgChar(
      table,
      this.config
    );
  }
};
__publicField(PgCharBuilder, _a43, "PgCharBuilder");
var _a44, _b26;
var PgChar = class extends (_b26 = PgColumn, _a44 = entityKind, _b26) {
  constructor() {
    super(...arguments);
    __publicField(this, "length", this.config.length);
    __publicField(this, "enumValues", this.config.enumValues);
  }
  getSQLType() {
    return this.length === void 0 ? `char` : `char(${this.length})`;
  }
};
__publicField(PgChar, _a44, "PgChar");
function char(a, b = {}) {
  const { name: name2, config } = getColumnNameAndConfig(a, b);
  return new PgCharBuilder(name2, config);
}

// node_modules/drizzle-orm/pg-core/columns/cidr.js
var _a45, _b27;
var PgCidrBuilder = class extends (_b27 = PgColumnBuilder, _a45 = entityKind, _b27) {
  constructor(name2) {
    super(name2, "string", "PgCidr");
  }
  /** @internal */
  build(table) {
    return new PgCidr(table, this.config);
  }
};
__publicField(PgCidrBuilder, _a45, "PgCidrBuilder");
var _a46, _b28;
var PgCidr = class extends (_b28 = PgColumn, _a46 = entityKind, _b28) {
  getSQLType() {
    return "cidr";
  }
};
__publicField(PgCidr, _a46, "PgCidr");
function cidr(name2) {
  return new PgCidrBuilder(name2 ?? "");
}

// node_modules/drizzle-orm/pg-core/columns/custom.js
var _a47, _b29;
var PgCustomColumnBuilder = class extends (_b29 = PgColumnBuilder, _a47 = entityKind, _b29) {
  constructor(name2, fieldConfig, customTypeParams) {
    super(name2, "custom", "PgCustomColumn");
    this.config.fieldConfig = fieldConfig;
    this.config.customTypeParams = customTypeParams;
  }
  /** @internal */
  build(table) {
    return new PgCustomColumn(
      table,
      this.config
    );
  }
};
__publicField(PgCustomColumnBuilder, _a47, "PgCustomColumnBuilder");
var _a48, _b30;
var PgCustomColumn = class extends (_b30 = PgColumn, _a48 = entityKind, _b30) {
  constructor(table, config) {
    super(table, config);
    __publicField(this, "sqlName");
    __publicField(this, "mapTo");
    __publicField(this, "mapFrom");
    this.sqlName = config.customTypeParams.dataType(config.fieldConfig);
    this.mapTo = config.customTypeParams.toDriver;
    this.mapFrom = config.customTypeParams.fromDriver;
  }
  getSQLType() {
    return this.sqlName;
  }
  mapFromDriverValue(value) {
    return typeof this.mapFrom === "function" ? this.mapFrom(value) : value;
  }
  mapToDriverValue(value) {
    return typeof this.mapTo === "function" ? this.mapTo(value) : value;
  }
};
__publicField(PgCustomColumn, _a48, "PgCustomColumn");
function customType(customTypeParams) {
  return (a, b) => {
    const { name: name2, config } = getColumnNameAndConfig(a, b);
    return new PgCustomColumnBuilder(name2, config, customTypeParams);
  };
}

// node_modules/drizzle-orm/pg-core/columns/date.common.js
var _a49, _b31;
var PgDateColumnBaseBuilder = class extends (_b31 = PgColumnBuilder, _a49 = entityKind, _b31) {
  defaultNow() {
    return this.default(sql`now()`);
  }
};
__publicField(PgDateColumnBaseBuilder, _a49, "PgDateColumnBaseBuilder");

// node_modules/drizzle-orm/pg-core/columns/date.js
var _a50, _b32;
var PgDateBuilder = class extends (_b32 = PgDateColumnBaseBuilder, _a50 = entityKind, _b32) {
  constructor(name2) {
    super(name2, "date", "PgDate");
  }
  /** @internal */
  build(table) {
    return new PgDate(table, this.config);
  }
};
__publicField(PgDateBuilder, _a50, "PgDateBuilder");
var _a51, _b33;
var PgDate = class extends (_b33 = PgColumn, _a51 = entityKind, _b33) {
  getSQLType() {
    return "date";
  }
  mapFromDriverValue(value) {
    return new Date(value);
  }
  mapToDriverValue(value) {
    return value.toISOString();
  }
};
__publicField(PgDate, _a51, "PgDate");
var _a52, _b34;
var PgDateStringBuilder = class extends (_b34 = PgDateColumnBaseBuilder, _a52 = entityKind, _b34) {
  constructor(name2) {
    super(name2, "string", "PgDateString");
  }
  /** @internal */
  build(table) {
    return new PgDateString(
      table,
      this.config
    );
  }
};
__publicField(PgDateStringBuilder, _a52, "PgDateStringBuilder");
var _a53, _b35;
var PgDateString = class extends (_b35 = PgColumn, _a53 = entityKind, _b35) {
  getSQLType() {
    return "date";
  }
};
__publicField(PgDateString, _a53, "PgDateString");
function date(a, b) {
  const { name: name2, config } = getColumnNameAndConfig(a, b);
  if ((config == null ? void 0 : config.mode) === "date") {
    return new PgDateBuilder(name2);
  }
  return new PgDateStringBuilder(name2);
}

// node_modules/drizzle-orm/pg-core/columns/double-precision.js
var _a54, _b36;
var PgDoublePrecisionBuilder = class extends (_b36 = PgColumnBuilder, _a54 = entityKind, _b36) {
  constructor(name2) {
    super(name2, "number", "PgDoublePrecision");
  }
  /** @internal */
  build(table) {
    return new PgDoublePrecision(
      table,
      this.config
    );
  }
};
__publicField(PgDoublePrecisionBuilder, _a54, "PgDoublePrecisionBuilder");
var _a55, _b37;
var PgDoublePrecision = class extends (_b37 = PgColumn, _a55 = entityKind, _b37) {
  getSQLType() {
    return "double precision";
  }
  mapFromDriverValue(value) {
    if (typeof value === "string") {
      return Number.parseFloat(value);
    }
    return value;
  }
};
__publicField(PgDoublePrecision, _a55, "PgDoublePrecision");
function doublePrecision(name2) {
  return new PgDoublePrecisionBuilder(name2 ?? "");
}

// node_modules/drizzle-orm/pg-core/columns/inet.js
var _a56, _b38;
var PgInetBuilder = class extends (_b38 = PgColumnBuilder, _a56 = entityKind, _b38) {
  constructor(name2) {
    super(name2, "string", "PgInet");
  }
  /** @internal */
  build(table) {
    return new PgInet(table, this.config);
  }
};
__publicField(PgInetBuilder, _a56, "PgInetBuilder");
var _a57, _b39;
var PgInet = class extends (_b39 = PgColumn, _a57 = entityKind, _b39) {
  getSQLType() {
    return "inet";
  }
};
__publicField(PgInet, _a57, "PgInet");
function inet(name2) {
  return new PgInetBuilder(name2 ?? "");
}

// node_modules/drizzle-orm/pg-core/columns/integer.js
var _a58, _b40;
var PgIntegerBuilder = class extends (_b40 = PgIntColumnBaseBuilder, _a58 = entityKind, _b40) {
  constructor(name2) {
    super(name2, "number", "PgInteger");
  }
  /** @internal */
  build(table) {
    return new PgInteger(table, this.config);
  }
};
__publicField(PgIntegerBuilder, _a58, "PgIntegerBuilder");
var _a59, _b41;
var PgInteger = class extends (_b41 = PgColumn, _a59 = entityKind, _b41) {
  getSQLType() {
    return "integer";
  }
  mapFromDriverValue(value) {
    if (typeof value === "string") {
      return Number.parseInt(value);
    }
    return value;
  }
};
__publicField(PgInteger, _a59, "PgInteger");
function integer(name2) {
  return new PgIntegerBuilder(name2 ?? "");
}

// node_modules/drizzle-orm/pg-core/columns/interval.js
var _a60, _b42;
var PgIntervalBuilder = class extends (_b42 = PgColumnBuilder, _a60 = entityKind, _b42) {
  constructor(name2, intervalConfig) {
    super(name2, "string", "PgInterval");
    this.config.intervalConfig = intervalConfig;
  }
  /** @internal */
  build(table) {
    return new PgInterval(table, this.config);
  }
};
__publicField(PgIntervalBuilder, _a60, "PgIntervalBuilder");
var _a61, _b43;
var PgInterval = class extends (_b43 = PgColumn, _a61 = entityKind, _b43) {
  constructor() {
    super(...arguments);
    __publicField(this, "fields", this.config.intervalConfig.fields);
    __publicField(this, "precision", this.config.intervalConfig.precision);
  }
  getSQLType() {
    const fields = this.fields ? ` ${this.fields}` : "";
    const precision = this.precision ? `(${this.precision})` : "";
    return `interval${fields}${precision}`;
  }
};
__publicField(PgInterval, _a61, "PgInterval");
function interval(a, b = {}) {
  const { name: name2, config } = getColumnNameAndConfig(a, b);
  return new PgIntervalBuilder(name2, config);
}

// node_modules/drizzle-orm/pg-core/columns/json.js
var _a62, _b44;
var PgJsonBuilder = class extends (_b44 = PgColumnBuilder, _a62 = entityKind, _b44) {
  constructor(name2) {
    super(name2, "json", "PgJson");
  }
  /** @internal */
  build(table) {
    return new PgJson(table, this.config);
  }
};
__publicField(PgJsonBuilder, _a62, "PgJsonBuilder");
var _a63, _b45;
var PgJson = class extends (_b45 = PgColumn, _a63 = entityKind, _b45) {
  constructor(table, config) {
    super(table, config);
  }
  getSQLType() {
    return "json";
  }
  mapToDriverValue(value) {
    return JSON.stringify(value);
  }
  mapFromDriverValue(value) {
    if (typeof value === "string") {
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    }
    return value;
  }
};
__publicField(PgJson, _a63, "PgJson");
function json(name2) {
  return new PgJsonBuilder(name2 ?? "");
}

// node_modules/drizzle-orm/pg-core/columns/jsonb.js
var _a64, _b46;
var PgJsonbBuilder = class extends (_b46 = PgColumnBuilder, _a64 = entityKind, _b46) {
  constructor(name2) {
    super(name2, "json", "PgJsonb");
  }
  /** @internal */
  build(table) {
    return new PgJsonb(table, this.config);
  }
};
__publicField(PgJsonbBuilder, _a64, "PgJsonbBuilder");
var _a65, _b47;
var PgJsonb = class extends (_b47 = PgColumn, _a65 = entityKind, _b47) {
  constructor(table, config) {
    super(table, config);
  }
  getSQLType() {
    return "jsonb";
  }
  mapToDriverValue(value) {
    return JSON.stringify(value);
  }
  mapFromDriverValue(value) {
    if (typeof value === "string") {
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    }
    return value;
  }
};
__publicField(PgJsonb, _a65, "PgJsonb");
function jsonb(name2) {
  return new PgJsonbBuilder(name2 ?? "");
}

// node_modules/drizzle-orm/pg-core/columns/line.js
var _a66, _b48;
var PgLineBuilder = class extends (_b48 = PgColumnBuilder, _a66 = entityKind, _b48) {
  constructor(name2) {
    super(name2, "array", "PgLine");
  }
  /** @internal */
  build(table) {
    return new PgLineTuple(
      table,
      this.config
    );
  }
};
__publicField(PgLineBuilder, _a66, "PgLineBuilder");
var _a67, _b49;
var PgLineTuple = class extends (_b49 = PgColumn, _a67 = entityKind, _b49) {
  getSQLType() {
    return "line";
  }
  mapFromDriverValue(value) {
    const [a, b, c] = value.slice(1, -1).split(",");
    return [Number.parseFloat(a), Number.parseFloat(b), Number.parseFloat(c)];
  }
  mapToDriverValue(value) {
    return `{${value[0]},${value[1]},${value[2]}}`;
  }
};
__publicField(PgLineTuple, _a67, "PgLine");
var _a68, _b50;
var PgLineABCBuilder = class extends (_b50 = PgColumnBuilder, _a68 = entityKind, _b50) {
  constructor(name2) {
    super(name2, "json", "PgLineABC");
  }
  /** @internal */
  build(table) {
    return new PgLineABC(
      table,
      this.config
    );
  }
};
__publicField(PgLineABCBuilder, _a68, "PgLineABCBuilder");
var _a69, _b51;
var PgLineABC = class extends (_b51 = PgColumn, _a69 = entityKind, _b51) {
  getSQLType() {
    return "line";
  }
  mapFromDriverValue(value) {
    const [a, b, c] = value.slice(1, -1).split(",");
    return { a: Number.parseFloat(a), b: Number.parseFloat(b), c: Number.parseFloat(c) };
  }
  mapToDriverValue(value) {
    return `{${value.a},${value.b},${value.c}}`;
  }
};
__publicField(PgLineABC, _a69, "PgLineABC");
function line(a, b) {
  const { name: name2, config } = getColumnNameAndConfig(a, b);
  if (!(config == null ? void 0 : config.mode) || config.mode === "tuple") {
    return new PgLineBuilder(name2);
  }
  return new PgLineABCBuilder(name2);
}

// node_modules/drizzle-orm/pg-core/columns/macaddr.js
var _a70, _b52;
var PgMacaddrBuilder = class extends (_b52 = PgColumnBuilder, _a70 = entityKind, _b52) {
  constructor(name2) {
    super(name2, "string", "PgMacaddr");
  }
  /** @internal */
  build(table) {
    return new PgMacaddr(table, this.config);
  }
};
__publicField(PgMacaddrBuilder, _a70, "PgMacaddrBuilder");
var _a71, _b53;
var PgMacaddr = class extends (_b53 = PgColumn, _a71 = entityKind, _b53) {
  getSQLType() {
    return "macaddr";
  }
};
__publicField(PgMacaddr, _a71, "PgMacaddr");
function macaddr(name2) {
  return new PgMacaddrBuilder(name2 ?? "");
}

// node_modules/drizzle-orm/pg-core/columns/macaddr8.js
var _a72, _b54;
var PgMacaddr8Builder = class extends (_b54 = PgColumnBuilder, _a72 = entityKind, _b54) {
  constructor(name2) {
    super(name2, "string", "PgMacaddr8");
  }
  /** @internal */
  build(table) {
    return new PgMacaddr8(table, this.config);
  }
};
__publicField(PgMacaddr8Builder, _a72, "PgMacaddr8Builder");
var _a73, _b55;
var PgMacaddr8 = class extends (_b55 = PgColumn, _a73 = entityKind, _b55) {
  getSQLType() {
    return "macaddr8";
  }
};
__publicField(PgMacaddr8, _a73, "PgMacaddr8");
function macaddr8(name2) {
  return new PgMacaddr8Builder(name2 ?? "");
}

// node_modules/drizzle-orm/pg-core/columns/numeric.js
var _a74, _b56;
var PgNumericBuilder = class extends (_b56 = PgColumnBuilder, _a74 = entityKind, _b56) {
  constructor(name2, precision, scale) {
    super(name2, "string", "PgNumeric");
    this.config.precision = precision;
    this.config.scale = scale;
  }
  /** @internal */
  build(table) {
    return new PgNumeric(table, this.config);
  }
};
__publicField(PgNumericBuilder, _a74, "PgNumericBuilder");
var _a75, _b57;
var PgNumeric = class extends (_b57 = PgColumn, _a75 = entityKind, _b57) {
  constructor(table, config) {
    super(table, config);
    __publicField(this, "precision");
    __publicField(this, "scale");
    this.precision = config.precision;
    this.scale = config.scale;
  }
  getSQLType() {
    if (this.precision !== void 0 && this.scale !== void 0) {
      return `numeric(${this.precision}, ${this.scale})`;
    } else if (this.precision === void 0) {
      return "numeric";
    } else {
      return `numeric(${this.precision})`;
    }
  }
};
__publicField(PgNumeric, _a75, "PgNumeric");
function numeric(a, b) {
  const { name: name2, config } = getColumnNameAndConfig(a, b);
  return new PgNumericBuilder(name2, config == null ? void 0 : config.precision, config == null ? void 0 : config.scale);
}
var decimal = numeric;

// node_modules/drizzle-orm/pg-core/columns/point.js
var _a76, _b58;
var PgPointTupleBuilder = class extends (_b58 = PgColumnBuilder, _a76 = entityKind, _b58) {
  constructor(name2) {
    super(name2, "array", "PgPointTuple");
  }
  /** @internal */
  build(table) {
    return new PgPointTuple(
      table,
      this.config
    );
  }
};
__publicField(PgPointTupleBuilder, _a76, "PgPointTupleBuilder");
var _a77, _b59;
var PgPointTuple = class extends (_b59 = PgColumn, _a77 = entityKind, _b59) {
  getSQLType() {
    return "point";
  }
  mapFromDriverValue(value) {
    if (typeof value === "string") {
      const [x, y] = value.slice(1, -1).split(",");
      return [Number.parseFloat(x), Number.parseFloat(y)];
    }
    return [value.x, value.y];
  }
  mapToDriverValue(value) {
    return `(${value[0]},${value[1]})`;
  }
};
__publicField(PgPointTuple, _a77, "PgPointTuple");
var _a78, _b60;
var PgPointObjectBuilder = class extends (_b60 = PgColumnBuilder, _a78 = entityKind, _b60) {
  constructor(name2) {
    super(name2, "json", "PgPointObject");
  }
  /** @internal */
  build(table) {
    return new PgPointObject(
      table,
      this.config
    );
  }
};
__publicField(PgPointObjectBuilder, _a78, "PgPointObjectBuilder");
var _a79, _b61;
var PgPointObject = class extends (_b61 = PgColumn, _a79 = entityKind, _b61) {
  getSQLType() {
    return "point";
  }
  mapFromDriverValue(value) {
    if (typeof value === "string") {
      const [x, y] = value.slice(1, -1).split(",");
      return { x: Number.parseFloat(x), y: Number.parseFloat(y) };
    }
    return value;
  }
  mapToDriverValue(value) {
    return `(${value.x},${value.y})`;
  }
};
__publicField(PgPointObject, _a79, "PgPointObject");
function point(a, b) {
  const { name: name2, config } = getColumnNameAndConfig(a, b);
  if (!(config == null ? void 0 : config.mode) || config.mode === "tuple") {
    return new PgPointTupleBuilder(name2);
  }
  return new PgPointObjectBuilder(name2);
}

// node_modules/drizzle-orm/pg-core/columns/postgis_extension/utils.js
function hexToBytes(hex) {
  const bytes = [];
  for (let c = 0; c < hex.length; c += 2) {
    bytes.push(Number.parseInt(hex.slice(c, c + 2), 16));
  }
  return new Uint8Array(bytes);
}
function bytesToFloat64(bytes, offset) {
  const buffer = new ArrayBuffer(8);
  const view = new DataView(buffer);
  for (let i = 0; i < 8; i++) {
    view.setUint8(i, bytes[offset + i]);
  }
  return view.getFloat64(0, true);
}
function parseEWKB(hex) {
  const bytes = hexToBytes(hex);
  let offset = 0;
  const byteOrder = bytes[offset];
  offset += 1;
  const view = new DataView(bytes.buffer);
  const geomType = view.getUint32(offset, byteOrder === 1);
  offset += 4;
  let _srid;
  if (geomType & 536870912) {
    _srid = view.getUint32(offset, byteOrder === 1);
    offset += 4;
  }
  if ((geomType & 65535) === 1) {
    const x = bytesToFloat64(bytes, offset);
    offset += 8;
    const y = bytesToFloat64(bytes, offset);
    offset += 8;
    return [x, y];
  }
  throw new Error("Unsupported geometry type");
}

// node_modules/drizzle-orm/pg-core/columns/postgis_extension/geometry.js
var _a80, _b62;
var PgGeometryBuilder = class extends (_b62 = PgColumnBuilder, _a80 = entityKind, _b62) {
  constructor(name2) {
    super(name2, "array", "PgGeometry");
  }
  /** @internal */
  build(table) {
    return new PgGeometry(
      table,
      this.config
    );
  }
};
__publicField(PgGeometryBuilder, _a80, "PgGeometryBuilder");
var _a81, _b63;
var PgGeometry = class extends (_b63 = PgColumn, _a81 = entityKind, _b63) {
  getSQLType() {
    return "geometry(point)";
  }
  mapFromDriverValue(value) {
    return parseEWKB(value);
  }
  mapToDriverValue(value) {
    return `point(${value[0]} ${value[1]})`;
  }
};
__publicField(PgGeometry, _a81, "PgGeometry");
var _a82, _b64;
var PgGeometryObjectBuilder = class extends (_b64 = PgColumnBuilder, _a82 = entityKind, _b64) {
  constructor(name2) {
    super(name2, "json", "PgGeometryObject");
  }
  /** @internal */
  build(table) {
    return new PgGeometryObject(
      table,
      this.config
    );
  }
};
__publicField(PgGeometryObjectBuilder, _a82, "PgGeometryObjectBuilder");
var _a83, _b65;
var PgGeometryObject = class extends (_b65 = PgColumn, _a83 = entityKind, _b65) {
  getSQLType() {
    return "geometry(point)";
  }
  mapFromDriverValue(value) {
    const parsed = parseEWKB(value);
    return { x: parsed[0], y: parsed[1] };
  }
  mapToDriverValue(value) {
    return `point(${value.x} ${value.y})`;
  }
};
__publicField(PgGeometryObject, _a83, "PgGeometryObject");
function geometry(a, b) {
  const { name: name2, config } = getColumnNameAndConfig(a, b);
  if (!(config == null ? void 0 : config.mode) || config.mode === "tuple") {
    return new PgGeometryBuilder(name2);
  }
  return new PgGeometryObjectBuilder(name2);
}

// node_modules/drizzle-orm/pg-core/columns/real.js
var _a84, _b66;
var PgRealBuilder = class extends (_b66 = PgColumnBuilder, _a84 = entityKind, _b66) {
  constructor(name2, length) {
    super(name2, "number", "PgReal");
    this.config.length = length;
  }
  /** @internal */
  build(table) {
    return new PgReal(table, this.config);
  }
};
__publicField(PgRealBuilder, _a84, "PgRealBuilder");
var _a85, _b67;
var PgReal = class extends (_b67 = PgColumn, _a85 = entityKind, _b67) {
  constructor(table, config) {
    super(table, config);
    __publicField(this, "mapFromDriverValue", (value) => {
      if (typeof value === "string") {
        return Number.parseFloat(value);
      }
      return value;
    });
  }
  getSQLType() {
    return "real";
  }
};
__publicField(PgReal, _a85, "PgReal");
function real(name2) {
  return new PgRealBuilder(name2 ?? "");
}

// node_modules/drizzle-orm/pg-core/columns/serial.js
var _a86, _b68;
var PgSerialBuilder = class extends (_b68 = PgColumnBuilder, _a86 = entityKind, _b68) {
  constructor(name2) {
    super(name2, "number", "PgSerial");
    this.config.hasDefault = true;
    this.config.notNull = true;
  }
  /** @internal */
  build(table) {
    return new PgSerial(table, this.config);
  }
};
__publicField(PgSerialBuilder, _a86, "PgSerialBuilder");
var _a87, _b69;
var PgSerial = class extends (_b69 = PgColumn, _a87 = entityKind, _b69) {
  getSQLType() {
    return "serial";
  }
};
__publicField(PgSerial, _a87, "PgSerial");
function serial(name2) {
  return new PgSerialBuilder(name2 ?? "");
}

// node_modules/drizzle-orm/pg-core/columns/smallint.js
var _a88, _b70;
var PgSmallIntBuilder = class extends (_b70 = PgIntColumnBaseBuilder, _a88 = entityKind, _b70) {
  constructor(name2) {
    super(name2, "number", "PgSmallInt");
  }
  /** @internal */
  build(table) {
    return new PgSmallInt(table, this.config);
  }
};
__publicField(PgSmallIntBuilder, _a88, "PgSmallIntBuilder");
var _a89, _b71;
var PgSmallInt = class extends (_b71 = PgColumn, _a89 = entityKind, _b71) {
  constructor() {
    super(...arguments);
    __publicField(this, "mapFromDriverValue", (value) => {
      if (typeof value === "string") {
        return Number(value);
      }
      return value;
    });
  }
  getSQLType() {
    return "smallint";
  }
};
__publicField(PgSmallInt, _a89, "PgSmallInt");
function smallint(name2) {
  return new PgSmallIntBuilder(name2 ?? "");
}

// node_modules/drizzle-orm/pg-core/columns/smallserial.js
var _a90, _b72;
var PgSmallSerialBuilder = class extends (_b72 = PgColumnBuilder, _a90 = entityKind, _b72) {
  constructor(name2) {
    super(name2, "number", "PgSmallSerial");
    this.config.hasDefault = true;
    this.config.notNull = true;
  }
  /** @internal */
  build(table) {
    return new PgSmallSerial(
      table,
      this.config
    );
  }
};
__publicField(PgSmallSerialBuilder, _a90, "PgSmallSerialBuilder");
var _a91, _b73;
var PgSmallSerial = class extends (_b73 = PgColumn, _a91 = entityKind, _b73) {
  getSQLType() {
    return "smallserial";
  }
};
__publicField(PgSmallSerial, _a91, "PgSmallSerial");
function smallserial(name2) {
  return new PgSmallSerialBuilder(name2 ?? "");
}

// node_modules/drizzle-orm/pg-core/columns/text.js
var _a92, _b74;
var PgTextBuilder = class extends (_b74 = PgColumnBuilder, _a92 = entityKind, _b74) {
  constructor(name2, config) {
    super(name2, "string", "PgText");
    this.config.enumValues = config.enum;
  }
  /** @internal */
  build(table) {
    return new PgText(table, this.config);
  }
};
__publicField(PgTextBuilder, _a92, "PgTextBuilder");
var _a93, _b75;
var PgText = class extends (_b75 = PgColumn, _a93 = entityKind, _b75) {
  constructor() {
    super(...arguments);
    __publicField(this, "enumValues", this.config.enumValues);
  }
  getSQLType() {
    return "text";
  }
};
__publicField(PgText, _a93, "PgText");
function text(a, b = {}) {
  const { name: name2, config } = getColumnNameAndConfig(a, b);
  return new PgTextBuilder(name2, config);
}

// node_modules/drizzle-orm/pg-core/columns/time.js
var _a94, _b76;
var PgTimeBuilder = class extends (_b76 = PgDateColumnBaseBuilder, _a94 = entityKind, _b76) {
  constructor(name2, withTimezone, precision) {
    super(name2, "string", "PgTime");
    this.withTimezone = withTimezone;
    this.precision = precision;
    this.config.withTimezone = withTimezone;
    this.config.precision = precision;
  }
  /** @internal */
  build(table) {
    return new PgTime(table, this.config);
  }
};
__publicField(PgTimeBuilder, _a94, "PgTimeBuilder");
var _a95, _b77;
var PgTime = class extends (_b77 = PgColumn, _a95 = entityKind, _b77) {
  constructor(table, config) {
    super(table, config);
    __publicField(this, "withTimezone");
    __publicField(this, "precision");
    this.withTimezone = config.withTimezone;
    this.precision = config.precision;
  }
  getSQLType() {
    const precision = this.precision === void 0 ? "" : `(${this.precision})`;
    return `time${precision}${this.withTimezone ? " with time zone" : ""}`;
  }
};
__publicField(PgTime, _a95, "PgTime");
function time(a, b = {}) {
  const { name: name2, config } = getColumnNameAndConfig(a, b);
  return new PgTimeBuilder(name2, config.withTimezone ?? false, config.precision);
}

// node_modules/drizzle-orm/pg-core/columns/timestamp.js
var _a96, _b78;
var PgTimestampBuilder = class extends (_b78 = PgDateColumnBaseBuilder, _a96 = entityKind, _b78) {
  constructor(name2, withTimezone, precision) {
    super(name2, "date", "PgTimestamp");
    this.config.withTimezone = withTimezone;
    this.config.precision = precision;
  }
  /** @internal */
  build(table) {
    return new PgTimestamp(table, this.config);
  }
};
__publicField(PgTimestampBuilder, _a96, "PgTimestampBuilder");
var _a97, _b79;
var PgTimestamp = class extends (_b79 = PgColumn, _a97 = entityKind, _b79) {
  constructor(table, config) {
    super(table, config);
    __publicField(this, "withTimezone");
    __publicField(this, "precision");
    __publicField(this, "mapFromDriverValue", (value) => {
      return new Date(this.withTimezone ? value : value + "+0000");
    });
    __publicField(this, "mapToDriverValue", (value) => {
      return value.toISOString();
    });
    this.withTimezone = config.withTimezone;
    this.precision = config.precision;
  }
  getSQLType() {
    const precision = this.precision === void 0 ? "" : ` (${this.precision})`;
    return `timestamp${precision}${this.withTimezone ? " with time zone" : ""}`;
  }
};
__publicField(PgTimestamp, _a97, "PgTimestamp");
var _a98, _b80;
var PgTimestampStringBuilder = class extends (_b80 = PgDateColumnBaseBuilder, _a98 = entityKind, _b80) {
  constructor(name2, withTimezone, precision) {
    super(name2, "string", "PgTimestampString");
    this.config.withTimezone = withTimezone;
    this.config.precision = precision;
  }
  /** @internal */
  build(table) {
    return new PgTimestampString(
      table,
      this.config
    );
  }
};
__publicField(PgTimestampStringBuilder, _a98, "PgTimestampStringBuilder");
var _a99, _b81;
var PgTimestampString = class extends (_b81 = PgColumn, _a99 = entityKind, _b81) {
  constructor(table, config) {
    super(table, config);
    __publicField(this, "withTimezone");
    __publicField(this, "precision");
    this.withTimezone = config.withTimezone;
    this.precision = config.precision;
  }
  getSQLType() {
    const precision = this.precision === void 0 ? "" : `(${this.precision})`;
    return `timestamp${precision}${this.withTimezone ? " with time zone" : ""}`;
  }
};
__publicField(PgTimestampString, _a99, "PgTimestampString");
function timestamp(a, b = {}) {
  const { name: name2, config } = getColumnNameAndConfig(a, b);
  if ((config == null ? void 0 : config.mode) === "string") {
    return new PgTimestampStringBuilder(name2, config.withTimezone ?? false, config.precision);
  }
  return new PgTimestampBuilder(name2, (config == null ? void 0 : config.withTimezone) ?? false, config == null ? void 0 : config.precision);
}

// node_modules/drizzle-orm/pg-core/columns/uuid.js
var _a100, _b82;
var PgUUIDBuilder = class extends (_b82 = PgColumnBuilder, _a100 = entityKind, _b82) {
  constructor(name2) {
    super(name2, "string", "PgUUID");
  }
  /**
   * Adds `default gen_random_uuid()` to the column definition.
   */
  defaultRandom() {
    return this.default(sql`gen_random_uuid()`);
  }
  /** @internal */
  build(table) {
    return new PgUUID(table, this.config);
  }
};
__publicField(PgUUIDBuilder, _a100, "PgUUIDBuilder");
var _a101, _b83;
var PgUUID = class extends (_b83 = PgColumn, _a101 = entityKind, _b83) {
  getSQLType() {
    return "uuid";
  }
};
__publicField(PgUUID, _a101, "PgUUID");
function uuid(name2) {
  return new PgUUIDBuilder(name2 ?? "");
}

// node_modules/drizzle-orm/pg-core/columns/varchar.js
var _a102, _b84;
var PgVarcharBuilder = class extends (_b84 = PgColumnBuilder, _a102 = entityKind, _b84) {
  constructor(name2, config) {
    super(name2, "string", "PgVarchar");
    this.config.length = config.length;
    this.config.enumValues = config.enum;
  }
  /** @internal */
  build(table) {
    return new PgVarchar(
      table,
      this.config
    );
  }
};
__publicField(PgVarcharBuilder, _a102, "PgVarcharBuilder");
var _a103, _b85;
var PgVarchar = class extends (_b85 = PgColumn, _a103 = entityKind, _b85) {
  constructor() {
    super(...arguments);
    __publicField(this, "length", this.config.length);
    __publicField(this, "enumValues", this.config.enumValues);
  }
  getSQLType() {
    return this.length === void 0 ? `varchar` : `varchar(${this.length})`;
  }
};
__publicField(PgVarchar, _a103, "PgVarchar");
function varchar(a, b = {}) {
  const { name: name2, config } = getColumnNameAndConfig(a, b);
  return new PgVarcharBuilder(name2, config);
}

// node_modules/drizzle-orm/pg-core/columns/vector_extension/bit.js
var _a104, _b86;
var PgBinaryVectorBuilder = class extends (_b86 = PgColumnBuilder, _a104 = entityKind, _b86) {
  constructor(name2, config) {
    super(name2, "string", "PgBinaryVector");
    this.config.dimensions = config.dimensions;
  }
  /** @internal */
  build(table) {
    return new PgBinaryVector(
      table,
      this.config
    );
  }
};
__publicField(PgBinaryVectorBuilder, _a104, "PgBinaryVectorBuilder");
var _a105, _b87;
var PgBinaryVector = class extends (_b87 = PgColumn, _a105 = entityKind, _b87) {
  constructor() {
    super(...arguments);
    __publicField(this, "dimensions", this.config.dimensions);
  }
  getSQLType() {
    return `bit(${this.dimensions})`;
  }
};
__publicField(PgBinaryVector, _a105, "PgBinaryVector");
function bit(a, b) {
  const { name: name2, config } = getColumnNameAndConfig(a, b);
  return new PgBinaryVectorBuilder(name2, config);
}

// node_modules/drizzle-orm/pg-core/columns/vector_extension/halfvec.js
var _a106, _b88;
var PgHalfVectorBuilder = class extends (_b88 = PgColumnBuilder, _a106 = entityKind, _b88) {
  constructor(name2, config) {
    super(name2, "array", "PgHalfVector");
    this.config.dimensions = config.dimensions;
  }
  /** @internal */
  build(table) {
    return new PgHalfVector(
      table,
      this.config
    );
  }
};
__publicField(PgHalfVectorBuilder, _a106, "PgHalfVectorBuilder");
var _a107, _b89;
var PgHalfVector = class extends (_b89 = PgColumn, _a107 = entityKind, _b89) {
  constructor() {
    super(...arguments);
    __publicField(this, "dimensions", this.config.dimensions);
  }
  getSQLType() {
    return `halfvec(${this.dimensions})`;
  }
  mapToDriverValue(value) {
    return JSON.stringify(value);
  }
  mapFromDriverValue(value) {
    return value.slice(1, -1).split(",").map((v) => Number.parseFloat(v));
  }
};
__publicField(PgHalfVector, _a107, "PgHalfVector");
function halfvec(a, b) {
  const { name: name2, config } = getColumnNameAndConfig(a, b);
  return new PgHalfVectorBuilder(name2, config);
}

// node_modules/drizzle-orm/pg-core/columns/vector_extension/sparsevec.js
var _a108, _b90;
var PgSparseVectorBuilder = class extends (_b90 = PgColumnBuilder, _a108 = entityKind, _b90) {
  constructor(name2, config) {
    super(name2, "string", "PgSparseVector");
    this.config.dimensions = config.dimensions;
  }
  /** @internal */
  build(table) {
    return new PgSparseVector(
      table,
      this.config
    );
  }
};
__publicField(PgSparseVectorBuilder, _a108, "PgSparseVectorBuilder");
var _a109, _b91;
var PgSparseVector = class extends (_b91 = PgColumn, _a109 = entityKind, _b91) {
  constructor() {
    super(...arguments);
    __publicField(this, "dimensions", this.config.dimensions);
  }
  getSQLType() {
    return `sparsevec(${this.dimensions})`;
  }
};
__publicField(PgSparseVector, _a109, "PgSparseVector");
function sparsevec(a, b) {
  const { name: name2, config } = getColumnNameAndConfig(a, b);
  return new PgSparseVectorBuilder(name2, config);
}

// node_modules/drizzle-orm/pg-core/columns/vector_extension/vector.js
var _a110, _b92;
var PgVectorBuilder = class extends (_b92 = PgColumnBuilder, _a110 = entityKind, _b92) {
  constructor(name2, config) {
    super(name2, "array", "PgVector");
    this.config.dimensions = config.dimensions;
  }
  /** @internal */
  build(table) {
    return new PgVector(
      table,
      this.config
    );
  }
};
__publicField(PgVectorBuilder, _a110, "PgVectorBuilder");
var _a111, _b93;
var PgVector = class extends (_b93 = PgColumn, _a111 = entityKind, _b93) {
  constructor() {
    super(...arguments);
    __publicField(this, "dimensions", this.config.dimensions);
  }
  getSQLType() {
    return `vector(${this.dimensions})`;
  }
  mapToDriverValue(value) {
    return JSON.stringify(value);
  }
  mapFromDriverValue(value) {
    return value.slice(1, -1).split(",").map((v) => Number.parseFloat(v));
  }
};
__publicField(PgVector, _a111, "PgVector");
function vector(a, b) {
  const { name: name2, config } = getColumnNameAndConfig(a, b);
  return new PgVectorBuilder(name2, config);
}

// node_modules/drizzle-orm/pg-core/columns/all.js
function getPgColumnBuilders() {
  return {
    bigint,
    bigserial,
    boolean,
    char,
    cidr,
    customType,
    date,
    doublePrecision,
    inet,
    integer,
    interval,
    json,
    jsonb,
    line,
    macaddr,
    macaddr8,
    numeric,
    point,
    geometry,
    real,
    serial,
    smallint,
    smallserial,
    text,
    time,
    timestamp,
    uuid,
    varchar,
    bit,
    halfvec,
    sparsevec,
    vector
  };
}

// node_modules/drizzle-orm/pg-core/table.js
var InlineForeignKeys = Symbol.for("drizzle:PgInlineForeignKeys");
var EnableRLS = Symbol.for("drizzle:EnableRLS");
var _a112, _b94, _c3, _d2, _e2;
var PgTable = class extends (_e2 = Table, _d2 = entityKind, _c3 = InlineForeignKeys, _b94 = EnableRLS, _a112 = Table.Symbol.ExtraConfigBuilder, _e2) {
  constructor() {
    super(...arguments);
    /**@internal */
    __publicField(this, _c3, []);
    /** @internal */
    __publicField(this, _b94, false);
    /** @internal */
    __publicField(this, _a112);
  }
};
__publicField(PgTable, _d2, "PgTable");
/** @internal */
__publicField(PgTable, "Symbol", Object.assign({}, Table.Symbol, {
  InlineForeignKeys,
  EnableRLS
}));
function pgTableWithSchema(name2, columns, extraConfig, schema, baseName = name2) {
  const rawTable = new PgTable(name2, schema, baseName);
  const parsedColumns = typeof columns === "function" ? columns(getPgColumnBuilders()) : columns;
  const builtColumns = Object.fromEntries(
    Object.entries(parsedColumns).map(([name22, colBuilderBase]) => {
      const colBuilder = colBuilderBase;
      colBuilder.setName(name22);
      const column = colBuilder.build(rawTable);
      rawTable[InlineForeignKeys].push(...colBuilder.buildForeignKeys(column, rawTable));
      return [name22, column];
    })
  );
  const builtColumnsForExtraConfig = Object.fromEntries(
    Object.entries(parsedColumns).map(([name22, colBuilderBase]) => {
      const colBuilder = colBuilderBase;
      colBuilder.setName(name22);
      const column = colBuilder.buildExtraConfigColumn(rawTable);
      return [name22, column];
    })
  );
  const table = Object.assign(rawTable, builtColumns);
  table[Table.Symbol.Columns] = builtColumns;
  table[Table.Symbol.ExtraConfigColumns] = builtColumnsForExtraConfig;
  if (extraConfig) {
    table[PgTable.Symbol.ExtraConfigBuilder] = extraConfig;
  }
  return Object.assign(table, {
    enableRLS: () => {
      table[PgTable.Symbol.EnableRLS] = true;
      return table;
    }
  });
}
var pgTable = (name2, columns, extraConfig) => {
  return pgTableWithSchema(name2, columns, extraConfig, void 0);
};
function pgTableCreator(customizeTableName) {
  return (name2, columns, extraConfig) => {
    return pgTableWithSchema(customizeTableName(name2), columns, extraConfig, void 0, name2);
  };
}

// node_modules/drizzle-orm/pg-core/primary-keys.js
function primaryKey(...config) {
  if (config[0].columns) {
    return new PrimaryKeyBuilder(config[0].columns, config[0].name);
  }
  return new PrimaryKeyBuilder(config);
}
var _a113;
_a113 = entityKind;
var PrimaryKeyBuilder = class {
  constructor(columns, name2) {
    /** @internal */
    __publicField(this, "columns");
    /** @internal */
    __publicField(this, "name");
    this.columns = columns;
    this.name = name2;
  }
  /** @internal */
  build(table) {
    return new PrimaryKey(table, this.columns, this.name);
  }
};
__publicField(PrimaryKeyBuilder, _a113, "PgPrimaryKeyBuilder");
var _a114;
_a114 = entityKind;
var PrimaryKey = class {
  constructor(table, columns, name2) {
    __publicField(this, "columns");
    __publicField(this, "name");
    this.table = table;
    this.columns = columns;
    this.name = name2;
  }
  getName() {
    return this.name ?? `${this.table[PgTable.Symbol.Name]}_${this.columns.map((column) => column.name).join("_")}_pk`;
  }
};
__publicField(PrimaryKey, _a114, "PgPrimaryKey");

// node_modules/drizzle-orm/relations.js
var _a115;
_a115 = entityKind;
var Relation = class {
  constructor(sourceTable, referencedTable, relationName) {
    __publicField(this, "referencedTableName");
    __publicField(this, "fieldName");
    this.sourceTable = sourceTable;
    this.referencedTable = referencedTable;
    this.relationName = relationName;
    this.referencedTableName = referencedTable[Table.Symbol.Name];
  }
};
__publicField(Relation, _a115, "Relation");
var _a116;
_a116 = entityKind;
var Relations = class {
  constructor(table, config) {
    this.table = table;
    this.config = config;
  }
};
__publicField(Relations, _a116, "Relations");
var _a117, _b95;
var _One = class _One extends (_b95 = Relation, _a117 = entityKind, _b95) {
  constructor(sourceTable, referencedTable, config, isNullable) {
    super(sourceTable, referencedTable, config == null ? void 0 : config.relationName);
    this.config = config;
    this.isNullable = isNullable;
  }
  withFieldName(fieldName) {
    const relation = new _One(
      this.sourceTable,
      this.referencedTable,
      this.config,
      this.isNullable
    );
    relation.fieldName = fieldName;
    return relation;
  }
};
__publicField(_One, _a117, "One");
var One = _One;
var _a118, _b96;
var _Many = class _Many extends (_b96 = Relation, _a118 = entityKind, _b96) {
  constructor(sourceTable, referencedTable, config) {
    super(sourceTable, referencedTable, config == null ? void 0 : config.relationName);
    this.config = config;
  }
  withFieldName(fieldName) {
    const relation = new _Many(
      this.sourceTable,
      this.referencedTable,
      this.config
    );
    relation.fieldName = fieldName;
    return relation;
  }
};
__publicField(_Many, _a118, "Many");
var Many = _Many;
function getOperators() {
  return {
    and,
    between,
    eq,
    exists,
    gt,
    gte,
    ilike,
    inArray,
    isNull,
    isNotNull,
    like,
    lt,
    lte,
    ne,
    not,
    notBetween,
    notExists,
    notLike,
    notIlike,
    notInArray,
    or,
    sql
  };
}
function getOrderByOperators() {
  return {
    sql,
    asc,
    desc
  };
}
function extractTablesRelationalConfig(schema, configHelpers) {
  var _a119;
  if (Object.keys(schema).length === 1 && "default" in schema && !is(schema["default"], Table)) {
    schema = schema["default"];
  }
  const tableNamesMap = {};
  const relationsBuffer = {};
  const tablesConfig = {};
  for (const [key, value] of Object.entries(schema)) {
    if (is(value, Table)) {
      const dbName = getTableUniqueName(value);
      const bufferedRelations = relationsBuffer[dbName];
      tableNamesMap[dbName] = key;
      tablesConfig[key] = {
        tsName: key,
        dbName: value[Table.Symbol.Name],
        schema: value[Table.Symbol.Schema],
        columns: value[Table.Symbol.Columns],
        relations: (bufferedRelations == null ? void 0 : bufferedRelations.relations) ?? {},
        primaryKey: (bufferedRelations == null ? void 0 : bufferedRelations.primaryKey) ?? []
      };
      for (const column of Object.values(
        value[Table.Symbol.Columns]
      )) {
        if (column.primary) {
          tablesConfig[key].primaryKey.push(column);
        }
      }
      const extraConfig = (_a119 = value[Table.Symbol.ExtraConfigBuilder]) == null ? void 0 : _a119.call(value, value[Table.Symbol.ExtraConfigColumns]);
      if (extraConfig) {
        for (const configEntry of Object.values(extraConfig)) {
          if (is(configEntry, PrimaryKeyBuilder)) {
            tablesConfig[key].primaryKey.push(...configEntry.columns);
          }
        }
      }
    } else if (is(value, Relations)) {
      const dbName = getTableUniqueName(value.table);
      const tableName = tableNamesMap[dbName];
      const relations2 = value.config(
        configHelpers(value.table)
      );
      let primaryKey2;
      for (const [relationName, relation] of Object.entries(relations2)) {
        if (tableName) {
          const tableConfig = tablesConfig[tableName];
          tableConfig.relations[relationName] = relation;
          if (primaryKey2) {
            tableConfig.primaryKey.push(...primaryKey2);
          }
        } else {
          if (!(dbName in relationsBuffer)) {
            relationsBuffer[dbName] = {
              relations: {},
              primaryKey: primaryKey2
            };
          }
          relationsBuffer[dbName].relations[relationName] = relation;
        }
      }
    }
  }
  return { tables: tablesConfig, tableNamesMap };
}
function relations(table, relations2) {
  return new Relations(
    table,
    (helpers) => Object.fromEntries(
      Object.entries(relations2(helpers)).map(([key, value]) => [
        key,
        value.withFieldName(key)
      ])
    )
  );
}
function createOne(sourceTable) {
  return function one(table, config) {
    return new One(
      sourceTable,
      table,
      config,
      (config == null ? void 0 : config.fields.reduce((res, f) => res && f.notNull, true)) ?? false
    );
  };
}
function createMany(sourceTable) {
  return function many(referencedTable, config) {
    return new Many(sourceTable, referencedTable, config);
  };
}
function normalizeRelation(schema, tableNamesMap, relation) {
  if (is(relation, One) && relation.config) {
    return {
      fields: relation.config.fields,
      references: relation.config.references
    };
  }
  const referencedTableTsName = tableNamesMap[getTableUniqueName(relation.referencedTable)];
  if (!referencedTableTsName) {
    throw new Error(
      `Table "${relation.referencedTable[Table.Symbol.Name]}" not found in schema`
    );
  }
  const referencedTableConfig = schema[referencedTableTsName];
  if (!referencedTableConfig) {
    throw new Error(`Table "${referencedTableTsName}" not found in schema`);
  }
  const sourceTable = relation.sourceTable;
  const sourceTableTsName = tableNamesMap[getTableUniqueName(sourceTable)];
  if (!sourceTableTsName) {
    throw new Error(
      `Table "${sourceTable[Table.Symbol.Name]}" not found in schema`
    );
  }
  const reverseRelations = [];
  for (const referencedTableRelation of Object.values(
    referencedTableConfig.relations
  )) {
    if (relation.relationName && relation !== referencedTableRelation && referencedTableRelation.relationName === relation.relationName || !relation.relationName && referencedTableRelation.referencedTable === relation.sourceTable) {
      reverseRelations.push(referencedTableRelation);
    }
  }
  if (reverseRelations.length > 1) {
    throw relation.relationName ? new Error(
      `There are multiple relations with name "${relation.relationName}" in table "${referencedTableTsName}"`
    ) : new Error(
      `There are multiple relations between "${referencedTableTsName}" and "${relation.sourceTable[Table.Symbol.Name]}". Please specify relation name`
    );
  }
  if (reverseRelations[0] && is(reverseRelations[0], One) && reverseRelations[0].config) {
    return {
      fields: reverseRelations[0].config.references,
      references: reverseRelations[0].config.fields
    };
  }
  throw new Error(
    `There is not enough information to infer relation "${sourceTableTsName}.${relation.fieldName}"`
  );
}
function createTableRelationsHelpers(sourceTable) {
  return {
    one: createOne(sourceTable),
    many: createMany(sourceTable)
  };
}
function mapRelationalRow(tablesConfig, tableConfig, row, buildQueryResultSelection, mapColumnValue = (value) => value) {
  const result = {};
  for (const [
    selectionItemIndex,
    selectionItem
  ] of buildQueryResultSelection.entries()) {
    if (selectionItem.isJson) {
      const relation = tableConfig.relations[selectionItem.tsKey];
      const rawSubRows = row[selectionItemIndex];
      const subRows = typeof rawSubRows === "string" ? JSON.parse(rawSubRows) : rawSubRows;
      result[selectionItem.tsKey] = is(relation, One) ? subRows && mapRelationalRow(
        tablesConfig,
        tablesConfig[selectionItem.relationTableTsKey],
        subRows,
        selectionItem.selection,
        mapColumnValue
      ) : subRows.map(
        (subRow) => mapRelationalRow(
          tablesConfig,
          tablesConfig[selectionItem.relationTableTsKey],
          subRow,
          selectionItem.selection,
          mapColumnValue
        )
      );
    } else {
      const value = mapColumnValue(row[selectionItemIndex]);
      const field = selectionItem.field;
      let decoder;
      if (is(field, Column)) {
        decoder = field;
      } else if (is(field, SQL)) {
        decoder = field.decoder;
      } else {
        decoder = field.sql.decoder;
      }
      result[selectionItem.tsKey] = value === null ? null : decoder.mapFromDriverValue(value);
    }
  }
  return result;
}

// node_modules/drizzle-orm/sql/functions/aggregate.js
function count(expression) {
  return sql`count(${expression || sql.raw("*")})`.mapWith(Number);
}
function countDistinct(expression) {
  return sql`count(distinct ${expression})`.mapWith(Number);
}
function avg(expression) {
  return sql`avg(${expression})`.mapWith(String);
}
function avgDistinct(expression) {
  return sql`avg(distinct ${expression})`.mapWith(String);
}
function sum(expression) {
  return sql`sum(${expression})`.mapWith(String);
}
function sumDistinct(expression) {
  return sql`sum(distinct ${expression})`.mapWith(String);
}
function max(expression) {
  return sql`max(${expression})`.mapWith(is(expression, Column) ? expression : String);
}
function min(expression) {
  return sql`min(${expression})`.mapWith(is(expression, Column) ? expression : String);
}

// node_modules/drizzle-orm/sql/functions/vector.js
function toSql(value) {
  return JSON.stringify(value);
}
function l2Distance(column, value) {
  if (Array.isArray(value)) {
    return sql`${column} <-> ${toSql(value)}`;
  }
  return sql`${column} <-> ${value}`;
}
function l1Distance(column, value) {
  if (Array.isArray(value)) {
    return sql`${column} <+> ${toSql(value)}`;
  }
  return sql`${column} <+> ${value}`;
}
function innerProduct(column, value) {
  if (Array.isArray(value)) {
    return sql`${column} <#> ${toSql(value)}`;
  }
  return sql`${column} <#> ${value}`;
}
function cosineDistance(column, value) {
  if (Array.isArray(value)) {
    return sql`${column} <=> ${toSql(value)}`;
  }
  return sql`${column} <=> ${value}`;
}
function hammingDistance(column, value) {
  if (Array.isArray(value)) {
    return sql`${column} <~> ${toSql(value)}`;
  }
  return sql`${column} <~> ${value}`;
}
function jaccardDistance(column, value) {
  if (Array.isArray(value)) {
    return sql`${column} <%> ${toSql(value)}`;
  }
  return sql`${column} <%> ${value}`;
}

export {
  entityKind,
  hasOwnEntityKind,
  is,
  Column,
  ColumnBuilder,
  ForeignKeyBuilder,
  ForeignKey,
  foreignKey,
  unique,
  uniqueKeyName,
  UniqueConstraintBuilder,
  UniqueOnConstraintBuilder,
  UniqueConstraint,
  parsePgNestedArray,
  parsePgArray,
  makePgArray,
  PgColumnBuilder,
  PgColumn,
  ExtraConfigColumn,
  IndexedColumn,
  PgArrayBuilder,
  PgArray,
  isPgEnum,
  PgEnumColumnBuilder,
  PgEnumColumn,
  pgEnum,
  pgEnumWithSchema,
  Subquery,
  WithSubquery,
  tracer,
  ViewBaseConfig,
  Schema,
  Columns,
  ExtraConfigColumns,
  OriginalName,
  BaseName,
  IsAlias,
  ExtraConfigBuilder,
  Table,
  isTable,
  getTableName,
  getTableUniqueName,
  FakePrimitiveParam,
  isSQLWrapper,
  StringChunk,
  SQL,
  Name,
  name,
  isDriverValueEncoder,
  noopDecoder,
  noopEncoder,
  noopMapper,
  Param,
  param,
  sql,
  Placeholder,
  placeholder,
  fillPlaceholders,
  View,
  isView,
  getViewName,
  ColumnAliasProxyHandler,
  TableAliasProxyHandler,
  RelationTableAliasProxyHandler,
  aliasedTable,
  aliasedRelation,
  aliasedTableColumn,
  mapColumnsInAliasedSQLToAlias,
  mapColumnsInSQLToAlias,
  DrizzleError,
  TransactionRollbackError,
  bindIfParam,
  eq,
  ne,
  and,
  or,
  not,
  gt,
  gte,
  lt,
  lte,
  inArray,
  notInArray,
  isNull,
  isNotNull,
  exists,
  notExists,
  between,
  notBetween,
  like,
  notLike,
  ilike,
  notIlike,
  arrayContains,
  arrayContained,
  arrayOverlaps,
  asc,
  desc,
  QueryPromise,
  mapResultRow,
  orderSelectedFields,
  haveSameKeys,
  mapUpdateSet,
  applyMixins,
  getTableColumns,
  getViewSelectedFields,
  getTableLikeName,
  getColumnNameAndConfig,
  isConfig,
  PgIntColumnBaseBuilder,
  PgBigInt53Builder,
  PgBigInt53,
  PgBigInt64Builder,
  PgBigInt64,
  bigint,
  PgBigSerial53Builder,
  PgBigSerial53,
  PgBigSerial64Builder,
  PgBigSerial64,
  bigserial,
  PgBooleanBuilder,
  PgBoolean,
  boolean,
  PgCharBuilder,
  PgChar,
  char,
  PgCidrBuilder,
  PgCidr,
  cidr,
  PgCustomColumnBuilder,
  PgCustomColumn,
  customType,
  PgDateBuilder,
  PgDate,
  PgDateStringBuilder,
  PgDateString,
  date,
  PgDoublePrecisionBuilder,
  PgDoublePrecision,
  doublePrecision,
  PgInetBuilder,
  PgInet,
  inet,
  PgIntegerBuilder,
  PgInteger,
  integer,
  PgIntervalBuilder,
  PgInterval,
  interval,
  PgJsonBuilder,
  PgJson,
  json,
  PgJsonbBuilder,
  PgJsonb,
  jsonb,
  PgLineBuilder,
  PgLineTuple,
  PgLineABCBuilder,
  PgLineABC,
  line,
  PgMacaddrBuilder,
  PgMacaddr,
  macaddr,
  PgMacaddr8Builder,
  PgMacaddr8,
  macaddr8,
  PgNumericBuilder,
  PgNumeric,
  numeric,
  decimal,
  PgPointTupleBuilder,
  PgPointTuple,
  PgPointObjectBuilder,
  PgPointObject,
  point,
  PgGeometryBuilder,
  PgGeometry,
  PgGeometryObjectBuilder,
  PgGeometryObject,
  geometry,
  PgRealBuilder,
  PgReal,
  real,
  PgSerialBuilder,
  PgSerial,
  serial,
  PgSmallIntBuilder,
  PgSmallInt,
  smallint,
  PgSmallSerialBuilder,
  PgSmallSerial,
  smallserial,
  PgTextBuilder,
  PgText,
  text,
  PgTimeBuilder,
  PgTime,
  time,
  PgTimestampBuilder,
  PgTimestamp,
  PgTimestampStringBuilder,
  PgTimestampString,
  timestamp,
  PgUUIDBuilder,
  PgUUID,
  uuid,
  PgVarcharBuilder,
  PgVarchar,
  varchar,
  PgBinaryVectorBuilder,
  PgBinaryVector,
  bit,
  PgHalfVectorBuilder,
  PgHalfVector,
  halfvec,
  PgSparseVectorBuilder,
  PgSparseVector,
  sparsevec,
  PgVectorBuilder,
  PgVector,
  vector,
  InlineForeignKeys,
  EnableRLS,
  PgTable,
  pgTableWithSchema,
  pgTable,
  pgTableCreator,
  primaryKey,
  PrimaryKeyBuilder,
  PrimaryKey,
  Relation,
  Relations,
  One,
  Many,
  getOperators,
  getOrderByOperators,
  extractTablesRelationalConfig,
  relations,
  createOne,
  createMany,
  normalizeRelation,
  createTableRelationsHelpers,
  mapRelationalRow,
  count,
  countDistinct,
  avg,
  avgDistinct,
  sum,
  sumDistinct,
  max,
  min,
  l2Distance,
  l1Distance,
  innerProduct,
  cosineDistance,
  hammingDistance,
  jaccardDistance
};
//# sourceMappingURL=chunk-MJCGN2UF.js.map
