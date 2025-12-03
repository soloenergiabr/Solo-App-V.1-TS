
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model User
 * 
 */
export type User = $Result.DefaultSelection<Prisma.$UserPayload>
/**
 * Model Client
 * 
 */
export type Client = $Result.DefaultSelection<Prisma.$ClientPayload>
/**
 * Model Inverter
 * 
 */
export type Inverter = $Result.DefaultSelection<Prisma.$InverterPayload>
/**
 * Model GenerationUnit
 * 
 */
export type GenerationUnit = $Result.DefaultSelection<Prisma.$GenerationUnitPayload>
/**
 * Model Indication
 * 
 */
export type Indication = $Result.DefaultSelection<Prisma.$IndicationPayload>
/**
 * Model Offer
 * 
 */
export type Offer = $Result.DefaultSelection<Prisma.$OfferPayload>
/**
 * Model FAQ
 * 
 */
export type FAQ = $Result.DefaultSelection<Prisma.$FAQPayload>
/**
 * Model Transaction
 * 
 */
export type Transaction = $Result.DefaultSelection<Prisma.$TransactionPayload>

/**
 * Enums
 */
export namespace $Enums {
  export const ClientStatus: {
  lead: 'lead',
  client: 'client',
  inactive: 'inactive'
};

export type ClientStatus = (typeof ClientStatus)[keyof typeof ClientStatus]


export const IndicationStatus: {
  pending: 'pending',
  approved: 'approved',
  rejected: 'rejected'
};

export type IndicationStatus = (typeof IndicationStatus)[keyof typeof IndicationStatus]


export const TransactionType: {
  indication_reward: 'indication_reward',
  offer_redemption: 'offer_redemption',
  withdrawal: 'withdrawal',
  manual_adjustment: 'manual_adjustment'
};

export type TransactionType = (typeof TransactionType)[keyof typeof TransactionType]

}

export type ClientStatus = $Enums.ClientStatus

export const ClientStatus: typeof $Enums.ClientStatus

export type IndicationStatus = $Enums.IndicationStatus

export const IndicationStatus: typeof $Enums.IndicationStatus

export type TransactionType = $Enums.TransactionType

export const TransactionType: typeof $Enums.TransactionType

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Users
 * const users = await prisma.user.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  const U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Users
   * const users = await prisma.user.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.user`: Exposes CRUD operations for the **User** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Users
    * const users = await prisma.user.findMany()
    * ```
    */
  get user(): Prisma.UserDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.client`: Exposes CRUD operations for the **Client** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Clients
    * const clients = await prisma.client.findMany()
    * ```
    */
  get client(): Prisma.ClientDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.inverter`: Exposes CRUD operations for the **Inverter** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Inverters
    * const inverters = await prisma.inverter.findMany()
    * ```
    */
  get inverter(): Prisma.InverterDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.generationUnit`: Exposes CRUD operations for the **GenerationUnit** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more GenerationUnits
    * const generationUnits = await prisma.generationUnit.findMany()
    * ```
    */
  get generationUnit(): Prisma.GenerationUnitDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.indication`: Exposes CRUD operations for the **Indication** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Indications
    * const indications = await prisma.indication.findMany()
    * ```
    */
  get indication(): Prisma.IndicationDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.offer`: Exposes CRUD operations for the **Offer** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Offers
    * const offers = await prisma.offer.findMany()
    * ```
    */
  get offer(): Prisma.OfferDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.fAQ`: Exposes CRUD operations for the **FAQ** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more FAQS
    * const fAQS = await prisma.fAQ.findMany()
    * ```
    */
  get fAQ(): Prisma.FAQDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.transaction`: Exposes CRUD operations for the **Transaction** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Transactions
    * const transactions = await prisma.transaction.findMany()
    * ```
    */
  get transaction(): Prisma.TransactionDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 6.16.2
   * Query Engine version: 1c57fdcd7e44b29b9313256c76699e91c3ac3c43
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    User: 'User',
    Client: 'Client',
    Inverter: 'Inverter',
    GenerationUnit: 'GenerationUnit',
    Indication: 'Indication',
    Offer: 'Offer',
    FAQ: 'FAQ',
    Transaction: 'Transaction'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "user" | "client" | "inverter" | "generationUnit" | "indication" | "offer" | "fAQ" | "transaction"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      User: {
        payload: Prisma.$UserPayload<ExtArgs>
        fields: Prisma.UserFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UserFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UserFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findFirst: {
            args: Prisma.UserFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UserFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findMany: {
            args: Prisma.UserFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          create: {
            args: Prisma.UserCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          createMany: {
            args: Prisma.UserCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.UserCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          delete: {
            args: Prisma.UserDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          update: {
            args: Prisma.UserUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          deleteMany: {
            args: Prisma.UserDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UserUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.UserUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          upsert: {
            args: Prisma.UserUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          aggregate: {
            args: Prisma.UserAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUser>
          }
          groupBy: {
            args: Prisma.UserGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserGroupByOutputType>[]
          }
          count: {
            args: Prisma.UserCountArgs<ExtArgs>
            result: $Utils.Optional<UserCountAggregateOutputType> | number
          }
        }
      }
      Client: {
        payload: Prisma.$ClientPayload<ExtArgs>
        fields: Prisma.ClientFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ClientFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClientPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ClientFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClientPayload>
          }
          findFirst: {
            args: Prisma.ClientFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClientPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ClientFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClientPayload>
          }
          findMany: {
            args: Prisma.ClientFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClientPayload>[]
          }
          create: {
            args: Prisma.ClientCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClientPayload>
          }
          createMany: {
            args: Prisma.ClientCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ClientCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClientPayload>[]
          }
          delete: {
            args: Prisma.ClientDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClientPayload>
          }
          update: {
            args: Prisma.ClientUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClientPayload>
          }
          deleteMany: {
            args: Prisma.ClientDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ClientUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ClientUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClientPayload>[]
          }
          upsert: {
            args: Prisma.ClientUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClientPayload>
          }
          aggregate: {
            args: Prisma.ClientAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateClient>
          }
          groupBy: {
            args: Prisma.ClientGroupByArgs<ExtArgs>
            result: $Utils.Optional<ClientGroupByOutputType>[]
          }
          count: {
            args: Prisma.ClientCountArgs<ExtArgs>
            result: $Utils.Optional<ClientCountAggregateOutputType> | number
          }
        }
      }
      Inverter: {
        payload: Prisma.$InverterPayload<ExtArgs>
        fields: Prisma.InverterFieldRefs
        operations: {
          findUnique: {
            args: Prisma.InverterFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InverterPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.InverterFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InverterPayload>
          }
          findFirst: {
            args: Prisma.InverterFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InverterPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.InverterFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InverterPayload>
          }
          findMany: {
            args: Prisma.InverterFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InverterPayload>[]
          }
          create: {
            args: Prisma.InverterCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InverterPayload>
          }
          createMany: {
            args: Prisma.InverterCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.InverterCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InverterPayload>[]
          }
          delete: {
            args: Prisma.InverterDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InverterPayload>
          }
          update: {
            args: Prisma.InverterUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InverterPayload>
          }
          deleteMany: {
            args: Prisma.InverterDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.InverterUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.InverterUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InverterPayload>[]
          }
          upsert: {
            args: Prisma.InverterUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InverterPayload>
          }
          aggregate: {
            args: Prisma.InverterAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateInverter>
          }
          groupBy: {
            args: Prisma.InverterGroupByArgs<ExtArgs>
            result: $Utils.Optional<InverterGroupByOutputType>[]
          }
          count: {
            args: Prisma.InverterCountArgs<ExtArgs>
            result: $Utils.Optional<InverterCountAggregateOutputType> | number
          }
        }
      }
      GenerationUnit: {
        payload: Prisma.$GenerationUnitPayload<ExtArgs>
        fields: Prisma.GenerationUnitFieldRefs
        operations: {
          findUnique: {
            args: Prisma.GenerationUnitFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GenerationUnitPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.GenerationUnitFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GenerationUnitPayload>
          }
          findFirst: {
            args: Prisma.GenerationUnitFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GenerationUnitPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.GenerationUnitFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GenerationUnitPayload>
          }
          findMany: {
            args: Prisma.GenerationUnitFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GenerationUnitPayload>[]
          }
          create: {
            args: Prisma.GenerationUnitCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GenerationUnitPayload>
          }
          createMany: {
            args: Prisma.GenerationUnitCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.GenerationUnitCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GenerationUnitPayload>[]
          }
          delete: {
            args: Prisma.GenerationUnitDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GenerationUnitPayload>
          }
          update: {
            args: Prisma.GenerationUnitUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GenerationUnitPayload>
          }
          deleteMany: {
            args: Prisma.GenerationUnitDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.GenerationUnitUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.GenerationUnitUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GenerationUnitPayload>[]
          }
          upsert: {
            args: Prisma.GenerationUnitUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GenerationUnitPayload>
          }
          aggregate: {
            args: Prisma.GenerationUnitAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateGenerationUnit>
          }
          groupBy: {
            args: Prisma.GenerationUnitGroupByArgs<ExtArgs>
            result: $Utils.Optional<GenerationUnitGroupByOutputType>[]
          }
          count: {
            args: Prisma.GenerationUnitCountArgs<ExtArgs>
            result: $Utils.Optional<GenerationUnitCountAggregateOutputType> | number
          }
        }
      }
      Indication: {
        payload: Prisma.$IndicationPayload<ExtArgs>
        fields: Prisma.IndicationFieldRefs
        operations: {
          findUnique: {
            args: Prisma.IndicationFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IndicationPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.IndicationFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IndicationPayload>
          }
          findFirst: {
            args: Prisma.IndicationFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IndicationPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.IndicationFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IndicationPayload>
          }
          findMany: {
            args: Prisma.IndicationFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IndicationPayload>[]
          }
          create: {
            args: Prisma.IndicationCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IndicationPayload>
          }
          createMany: {
            args: Prisma.IndicationCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.IndicationCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IndicationPayload>[]
          }
          delete: {
            args: Prisma.IndicationDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IndicationPayload>
          }
          update: {
            args: Prisma.IndicationUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IndicationPayload>
          }
          deleteMany: {
            args: Prisma.IndicationDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.IndicationUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.IndicationUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IndicationPayload>[]
          }
          upsert: {
            args: Prisma.IndicationUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IndicationPayload>
          }
          aggregate: {
            args: Prisma.IndicationAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateIndication>
          }
          groupBy: {
            args: Prisma.IndicationGroupByArgs<ExtArgs>
            result: $Utils.Optional<IndicationGroupByOutputType>[]
          }
          count: {
            args: Prisma.IndicationCountArgs<ExtArgs>
            result: $Utils.Optional<IndicationCountAggregateOutputType> | number
          }
        }
      }
      Offer: {
        payload: Prisma.$OfferPayload<ExtArgs>
        fields: Prisma.OfferFieldRefs
        operations: {
          findUnique: {
            args: Prisma.OfferFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OfferPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.OfferFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OfferPayload>
          }
          findFirst: {
            args: Prisma.OfferFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OfferPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.OfferFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OfferPayload>
          }
          findMany: {
            args: Prisma.OfferFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OfferPayload>[]
          }
          create: {
            args: Prisma.OfferCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OfferPayload>
          }
          createMany: {
            args: Prisma.OfferCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.OfferCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OfferPayload>[]
          }
          delete: {
            args: Prisma.OfferDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OfferPayload>
          }
          update: {
            args: Prisma.OfferUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OfferPayload>
          }
          deleteMany: {
            args: Prisma.OfferDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.OfferUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.OfferUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OfferPayload>[]
          }
          upsert: {
            args: Prisma.OfferUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OfferPayload>
          }
          aggregate: {
            args: Prisma.OfferAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateOffer>
          }
          groupBy: {
            args: Prisma.OfferGroupByArgs<ExtArgs>
            result: $Utils.Optional<OfferGroupByOutputType>[]
          }
          count: {
            args: Prisma.OfferCountArgs<ExtArgs>
            result: $Utils.Optional<OfferCountAggregateOutputType> | number
          }
        }
      }
      FAQ: {
        payload: Prisma.$FAQPayload<ExtArgs>
        fields: Prisma.FAQFieldRefs
        operations: {
          findUnique: {
            args: Prisma.FAQFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FAQPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.FAQFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FAQPayload>
          }
          findFirst: {
            args: Prisma.FAQFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FAQPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.FAQFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FAQPayload>
          }
          findMany: {
            args: Prisma.FAQFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FAQPayload>[]
          }
          create: {
            args: Prisma.FAQCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FAQPayload>
          }
          createMany: {
            args: Prisma.FAQCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.FAQCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FAQPayload>[]
          }
          delete: {
            args: Prisma.FAQDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FAQPayload>
          }
          update: {
            args: Prisma.FAQUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FAQPayload>
          }
          deleteMany: {
            args: Prisma.FAQDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.FAQUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.FAQUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FAQPayload>[]
          }
          upsert: {
            args: Prisma.FAQUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FAQPayload>
          }
          aggregate: {
            args: Prisma.FAQAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateFAQ>
          }
          groupBy: {
            args: Prisma.FAQGroupByArgs<ExtArgs>
            result: $Utils.Optional<FAQGroupByOutputType>[]
          }
          count: {
            args: Prisma.FAQCountArgs<ExtArgs>
            result: $Utils.Optional<FAQCountAggregateOutputType> | number
          }
        }
      }
      Transaction: {
        payload: Prisma.$TransactionPayload<ExtArgs>
        fields: Prisma.TransactionFieldRefs
        operations: {
          findUnique: {
            args: Prisma.TransactionFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TransactionPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.TransactionFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TransactionPayload>
          }
          findFirst: {
            args: Prisma.TransactionFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TransactionPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.TransactionFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TransactionPayload>
          }
          findMany: {
            args: Prisma.TransactionFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TransactionPayload>[]
          }
          create: {
            args: Prisma.TransactionCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TransactionPayload>
          }
          createMany: {
            args: Prisma.TransactionCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.TransactionCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TransactionPayload>[]
          }
          delete: {
            args: Prisma.TransactionDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TransactionPayload>
          }
          update: {
            args: Prisma.TransactionUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TransactionPayload>
          }
          deleteMany: {
            args: Prisma.TransactionDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.TransactionUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.TransactionUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TransactionPayload>[]
          }
          upsert: {
            args: Prisma.TransactionUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TransactionPayload>
          }
          aggregate: {
            args: Prisma.TransactionAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTransaction>
          }
          groupBy: {
            args: Prisma.TransactionGroupByArgs<ExtArgs>
            result: $Utils.Optional<TransactionGroupByOutputType>[]
          }
          count: {
            args: Prisma.TransactionCountArgs<ExtArgs>
            result: $Utils.Optional<TransactionCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Shorthand for `emit: 'stdout'`
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events only
     * log: [
     *   { emit: 'event', level: 'query' },
     *   { emit: 'event', level: 'info' },
     *   { emit: 'event', level: 'warn' }
     *   { emit: 'event', level: 'error' }
     * ]
     * 
     * / Emit as events and log to stdout
     * og: [
     *  { emit: 'stdout', level: 'query' },
     *  { emit: 'stdout', level: 'info' },
     *  { emit: 'stdout', level: 'warn' }
     *  { emit: 'stdout', level: 'error' }
     * 
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Instance of a Driver Adapter, e.g., like one provided by `@prisma/adapter-planetscale`
     */
    adapter?: runtime.SqlDriverAdapterFactory | null
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
  }
  export type GlobalOmitConfig = {
    user?: UserOmit
    client?: ClientOmit
    inverter?: InverterOmit
    generationUnit?: GenerationUnitOmit
    indication?: IndicationOmit
    offer?: OfferOmit
    fAQ?: FAQOmit
    transaction?: TransactionOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;

  export type GetLogType<T> = CheckIsLogLevel<
    T extends LogDefinition ? T['level'] : T
  >;

  export type GetEvents<T extends any[]> = T extends Array<LogLevel | LogDefinition>
    ? GetLogType<T[number]>
    : never;

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type ClientCountOutputType
   */

  export type ClientCountOutputType = {
    inverters: number
    users: number
    indicationsAsReferrer: number
    indicationsAsReferred: number
    transactions: number
  }

  export type ClientCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    inverters?: boolean | ClientCountOutputTypeCountInvertersArgs
    users?: boolean | ClientCountOutputTypeCountUsersArgs
    indicationsAsReferrer?: boolean | ClientCountOutputTypeCountIndicationsAsReferrerArgs
    indicationsAsReferred?: boolean | ClientCountOutputTypeCountIndicationsAsReferredArgs
    transactions?: boolean | ClientCountOutputTypeCountTransactionsArgs
  }

  // Custom InputTypes
  /**
   * ClientCountOutputType without action
   */
  export type ClientCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ClientCountOutputType
     */
    select?: ClientCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * ClientCountOutputType without action
   */
  export type ClientCountOutputTypeCountInvertersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: InverterWhereInput
  }

  /**
   * ClientCountOutputType without action
   */
  export type ClientCountOutputTypeCountUsersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserWhereInput
  }

  /**
   * ClientCountOutputType without action
   */
  export type ClientCountOutputTypeCountIndicationsAsReferrerArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: IndicationWhereInput
  }

  /**
   * ClientCountOutputType without action
   */
  export type ClientCountOutputTypeCountIndicationsAsReferredArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: IndicationWhereInput
  }

  /**
   * ClientCountOutputType without action
   */
  export type ClientCountOutputTypeCountTransactionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TransactionWhereInput
  }


  /**
   * Count Type InverterCountOutputType
   */

  export type InverterCountOutputType = {
    generationUnits: number
  }

  export type InverterCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    generationUnits?: boolean | InverterCountOutputTypeCountGenerationUnitsArgs
  }

  // Custom InputTypes
  /**
   * InverterCountOutputType without action
   */
  export type InverterCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InverterCountOutputType
     */
    select?: InverterCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * InverterCountOutputType without action
   */
  export type InverterCountOutputTypeCountGenerationUnitsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: GenerationUnitWhereInput
  }


  /**
   * Models
   */

  /**
   * Model User
   */

  export type AggregateUser = {
    _count: UserCountAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  export type UserMinAggregateOutputType = {
    id: string | null
    email: string | null
    name: string | null
    password: string | null
    clientId: string | null
    isActive: boolean | null
    resetPasswordToken: string | null
    resetPasswordExpires: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type UserMaxAggregateOutputType = {
    id: string | null
    email: string | null
    name: string | null
    password: string | null
    clientId: string | null
    isActive: boolean | null
    resetPasswordToken: string | null
    resetPasswordExpires: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type UserCountAggregateOutputType = {
    id: number
    email: number
    name: number
    password: number
    roles: number
    permissions: number
    clientId: number
    isActive: number
    resetPasswordToken: number
    resetPasswordExpires: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type UserMinAggregateInputType = {
    id?: true
    email?: true
    name?: true
    password?: true
    clientId?: true
    isActive?: true
    resetPasswordToken?: true
    resetPasswordExpires?: true
    createdAt?: true
    updatedAt?: true
  }

  export type UserMaxAggregateInputType = {
    id?: true
    email?: true
    name?: true
    password?: true
    clientId?: true
    isActive?: true
    resetPasswordToken?: true
    resetPasswordExpires?: true
    createdAt?: true
    updatedAt?: true
  }

  export type UserCountAggregateInputType = {
    id?: true
    email?: true
    name?: true
    password?: true
    roles?: true
    permissions?: true
    clientId?: true
    isActive?: true
    resetPasswordToken?: true
    resetPasswordExpires?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type UserAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which User to aggregate.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Users
    **/
    _count?: true | UserCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserMaxAggregateInputType
  }

  export type GetUserAggregateType<T extends UserAggregateArgs> = {
        [P in keyof T & keyof AggregateUser]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUser[P]>
      : GetScalarType<T[P], AggregateUser[P]>
  }




  export type UserGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserWhereInput
    orderBy?: UserOrderByWithAggregationInput | UserOrderByWithAggregationInput[]
    by: UserScalarFieldEnum[] | UserScalarFieldEnum
    having?: UserScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserCountAggregateInputType | true
    _min?: UserMinAggregateInputType
    _max?: UserMaxAggregateInputType
  }

  export type UserGroupByOutputType = {
    id: string
    email: string
    name: string
    password: string
    roles: string[]
    permissions: string[]
    clientId: string | null
    isActive: boolean
    resetPasswordToken: string | null
    resetPasswordExpires: Date | null
    createdAt: Date
    updatedAt: Date
    _count: UserCountAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  type GetUserGroupByPayload<T extends UserGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserGroupByOutputType[P]>
            : GetScalarType<T[P], UserGroupByOutputType[P]>
        }
      >
    >


  export type UserSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    name?: boolean
    password?: boolean
    roles?: boolean
    permissions?: boolean
    clientId?: boolean
    isActive?: boolean
    resetPasswordToken?: boolean
    resetPasswordExpires?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    client?: boolean | User$clientArgs<ExtArgs>
  }, ExtArgs["result"]["user"]>

  export type UserSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    name?: boolean
    password?: boolean
    roles?: boolean
    permissions?: boolean
    clientId?: boolean
    isActive?: boolean
    resetPasswordToken?: boolean
    resetPasswordExpires?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    client?: boolean | User$clientArgs<ExtArgs>
  }, ExtArgs["result"]["user"]>

  export type UserSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    name?: boolean
    password?: boolean
    roles?: boolean
    permissions?: boolean
    clientId?: boolean
    isActive?: boolean
    resetPasswordToken?: boolean
    resetPasswordExpires?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    client?: boolean | User$clientArgs<ExtArgs>
  }, ExtArgs["result"]["user"]>

  export type UserSelectScalar = {
    id?: boolean
    email?: boolean
    name?: boolean
    password?: boolean
    roles?: boolean
    permissions?: boolean
    clientId?: boolean
    isActive?: boolean
    resetPasswordToken?: boolean
    resetPasswordExpires?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type UserOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "email" | "name" | "password" | "roles" | "permissions" | "clientId" | "isActive" | "resetPasswordToken" | "resetPasswordExpires" | "createdAt" | "updatedAt", ExtArgs["result"]["user"]>
  export type UserInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    client?: boolean | User$clientArgs<ExtArgs>
  }
  export type UserIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    client?: boolean | User$clientArgs<ExtArgs>
  }
  export type UserIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    client?: boolean | User$clientArgs<ExtArgs>
  }

  export type $UserPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "User"
    objects: {
      client: Prisma.$ClientPayload<ExtArgs> | null
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      email: string
      name: string
      password: string
      roles: string[]
      permissions: string[]
      clientId: string | null
      isActive: boolean
      resetPasswordToken: string | null
      resetPasswordExpires: Date | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["user"]>
    composites: {}
  }

  type UserGetPayload<S extends boolean | null | undefined | UserDefaultArgs> = $Result.GetResult<Prisma.$UserPayload, S>

  type UserCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<UserFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: UserCountAggregateInputType | true
    }

  export interface UserDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['User'], meta: { name: 'User' } }
    /**
     * Find zero or one User that matches the filter.
     * @param {UserFindUniqueArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserFindUniqueArgs>(args: SelectSubset<T, UserFindUniqueArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one User that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {UserFindUniqueOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserFindUniqueOrThrowArgs>(args: SelectSubset<T, UserFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserFindFirstArgs>(args?: SelectSubset<T, UserFindFirstArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserFindFirstOrThrowArgs>(args?: SelectSubset<T, UserFindFirstOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Users that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Users
     * const users = await prisma.user.findMany()
     * 
     * // Get first 10 Users
     * const users = await prisma.user.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const userWithIdOnly = await prisma.user.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UserFindManyArgs>(args?: SelectSubset<T, UserFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a User.
     * @param {UserCreateArgs} args - Arguments to create a User.
     * @example
     * // Create one User
     * const User = await prisma.user.create({
     *   data: {
     *     // ... data to create a User
     *   }
     * })
     * 
     */
    create<T extends UserCreateArgs>(args: SelectSubset<T, UserCreateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Users.
     * @param {UserCreateManyArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UserCreateManyArgs>(args?: SelectSubset<T, UserCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Users and returns the data saved in the database.
     * @param {UserCreateManyAndReturnArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Users and only return the `id`
     * const userWithIdOnly = await prisma.user.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends UserCreateManyAndReturnArgs>(args?: SelectSubset<T, UserCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a User.
     * @param {UserDeleteArgs} args - Arguments to delete one User.
     * @example
     * // Delete one User
     * const User = await prisma.user.delete({
     *   where: {
     *     // ... filter to delete one User
     *   }
     * })
     * 
     */
    delete<T extends UserDeleteArgs>(args: SelectSubset<T, UserDeleteArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one User.
     * @param {UserUpdateArgs} args - Arguments to update one User.
     * @example
     * // Update one User
     * const user = await prisma.user.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UserUpdateArgs>(args: SelectSubset<T, UserUpdateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Users.
     * @param {UserDeleteManyArgs} args - Arguments to filter Users to delete.
     * @example
     * // Delete a few Users
     * const { count } = await prisma.user.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UserDeleteManyArgs>(args?: SelectSubset<T, UserDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UserUpdateManyArgs>(args: SelectSubset<T, UserUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users and returns the data updated in the database.
     * @param {UserUpdateManyAndReturnArgs} args - Arguments to update many Users.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Users and only return the `id`
     * const userWithIdOnly = await prisma.user.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends UserUpdateManyAndReturnArgs>(args: SelectSubset<T, UserUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one User.
     * @param {UserUpsertArgs} args - Arguments to update or create a User.
     * @example
     * // Update or create a User
     * const user = await prisma.user.upsert({
     *   create: {
     *     // ... data to create a User
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the User we want to update
     *   }
     * })
     */
    upsert<T extends UserUpsertArgs>(args: SelectSubset<T, UserUpsertArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserCountArgs} args - Arguments to filter Users to count.
     * @example
     * // Count the number of Users
     * const count = await prisma.user.count({
     *   where: {
     *     // ... the filter for the Users we want to count
     *   }
     * })
    **/
    count<T extends UserCountArgs>(
      args?: Subset<T, UserCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UserAggregateArgs>(args: Subset<T, UserAggregateArgs>): Prisma.PrismaPromise<GetUserAggregateType<T>>

    /**
     * Group by User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends UserGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserGroupByArgs['orderBy'] }
        : { orderBy?: UserGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, UserGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the User model
   */
  readonly fields: UserFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for User.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    client<T extends User$clientArgs<ExtArgs> = {}>(args?: Subset<T, User$clientArgs<ExtArgs>>): Prisma__ClientClient<$Result.GetResult<Prisma.$ClientPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the User model
   */
  interface UserFieldRefs {
    readonly id: FieldRef<"User", 'String'>
    readonly email: FieldRef<"User", 'String'>
    readonly name: FieldRef<"User", 'String'>
    readonly password: FieldRef<"User", 'String'>
    readonly roles: FieldRef<"User", 'String[]'>
    readonly permissions: FieldRef<"User", 'String[]'>
    readonly clientId: FieldRef<"User", 'String'>
    readonly isActive: FieldRef<"User", 'Boolean'>
    readonly resetPasswordToken: FieldRef<"User", 'String'>
    readonly resetPasswordExpires: FieldRef<"User", 'DateTime'>
    readonly createdAt: FieldRef<"User", 'DateTime'>
    readonly updatedAt: FieldRef<"User", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * User findUnique
   */
  export type UserFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findUniqueOrThrow
   */
  export type UserFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findFirst
   */
  export type UserFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findFirstOrThrow
   */
  export type UserFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findMany
   */
  export type UserFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which Users to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User create
   */
  export type UserCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to create a User.
     */
    data: XOR<UserCreateInput, UserUncheckedCreateInput>
  }

  /**
   * User createMany
   */
  export type UserCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User createManyAndReturn
   */
  export type UserCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * User update
   */
  export type UserUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to update a User.
     */
    data: XOR<UserUpdateInput, UserUncheckedUpdateInput>
    /**
     * Choose, which User to update.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User updateMany
   */
  export type UserUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
  }

  /**
   * User updateManyAndReturn
   */
  export type UserUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * User upsert
   */
  export type UserUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The filter to search for the User to update in case it exists.
     */
    where: UserWhereUniqueInput
    /**
     * In case the User found by the `where` argument doesn't exist, create a new User with this data.
     */
    create: XOR<UserCreateInput, UserUncheckedCreateInput>
    /**
     * In case the User was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserUpdateInput, UserUncheckedUpdateInput>
  }

  /**
   * User delete
   */
  export type UserDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter which User to delete.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User deleteMany
   */
  export type UserDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Users to delete
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to delete.
     */
    limit?: number
  }

  /**
   * User.client
   */
  export type User$clientArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Client
     */
    select?: ClientSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Client
     */
    omit?: ClientOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClientInclude<ExtArgs> | null
    where?: ClientWhereInput
  }

  /**
   * User without action
   */
  export type UserDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
  }


  /**
   * Model Client
   */

  export type AggregateClient = {
    _count: ClientCountAggregateOutputType | null
    _avg: ClientAvgAggregateOutputType | null
    _sum: ClientSumAggregateOutputType | null
    _min: ClientMinAggregateOutputType | null
    _max: ClientMaxAggregateOutputType | null
  }

  export type ClientAvgAggregateOutputType = {
    avgEnergyCost: number | null
    soloCoinBalance: number | null
  }

  export type ClientSumAggregateOutputType = {
    avgEnergyCost: number | null
    soloCoinBalance: number | null
  }

  export type ClientMinAggregateOutputType = {
    id: string | null
    name: string | null
    email: string | null
    cpfCnpj: string | null
    phone: string | null
    address: string | null
    avgEnergyCost: number | null
    enelInvoiceFile: string | null
    soloCoinBalance: number | null
    indicationCode: string | null
    status: $Enums.ClientStatus | null
    createdAt: Date | null
    updatedAt: Date | null
    deletedAt: Date | null
  }

  export type ClientMaxAggregateOutputType = {
    id: string | null
    name: string | null
    email: string | null
    cpfCnpj: string | null
    phone: string | null
    address: string | null
    avgEnergyCost: number | null
    enelInvoiceFile: string | null
    soloCoinBalance: number | null
    indicationCode: string | null
    status: $Enums.ClientStatus | null
    createdAt: Date | null
    updatedAt: Date | null
    deletedAt: Date | null
  }

  export type ClientCountAggregateOutputType = {
    id: number
    name: number
    email: number
    cpfCnpj: number
    phone: number
    address: number
    avgEnergyCost: number
    enelInvoiceFile: number
    soloCoinBalance: number
    indicationCode: number
    status: number
    createdAt: number
    updatedAt: number
    deletedAt: number
    _all: number
  }


  export type ClientAvgAggregateInputType = {
    avgEnergyCost?: true
    soloCoinBalance?: true
  }

  export type ClientSumAggregateInputType = {
    avgEnergyCost?: true
    soloCoinBalance?: true
  }

  export type ClientMinAggregateInputType = {
    id?: true
    name?: true
    email?: true
    cpfCnpj?: true
    phone?: true
    address?: true
    avgEnergyCost?: true
    enelInvoiceFile?: true
    soloCoinBalance?: true
    indicationCode?: true
    status?: true
    createdAt?: true
    updatedAt?: true
    deletedAt?: true
  }

  export type ClientMaxAggregateInputType = {
    id?: true
    name?: true
    email?: true
    cpfCnpj?: true
    phone?: true
    address?: true
    avgEnergyCost?: true
    enelInvoiceFile?: true
    soloCoinBalance?: true
    indicationCode?: true
    status?: true
    createdAt?: true
    updatedAt?: true
    deletedAt?: true
  }

  export type ClientCountAggregateInputType = {
    id?: true
    name?: true
    email?: true
    cpfCnpj?: true
    phone?: true
    address?: true
    avgEnergyCost?: true
    enelInvoiceFile?: true
    soloCoinBalance?: true
    indicationCode?: true
    status?: true
    createdAt?: true
    updatedAt?: true
    deletedAt?: true
    _all?: true
  }

  export type ClientAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Client to aggregate.
     */
    where?: ClientWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Clients to fetch.
     */
    orderBy?: ClientOrderByWithRelationInput | ClientOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ClientWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Clients from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Clients.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Clients
    **/
    _count?: true | ClientCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ClientAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ClientSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ClientMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ClientMaxAggregateInputType
  }

  export type GetClientAggregateType<T extends ClientAggregateArgs> = {
        [P in keyof T & keyof AggregateClient]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateClient[P]>
      : GetScalarType<T[P], AggregateClient[P]>
  }




  export type ClientGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ClientWhereInput
    orderBy?: ClientOrderByWithAggregationInput | ClientOrderByWithAggregationInput[]
    by: ClientScalarFieldEnum[] | ClientScalarFieldEnum
    having?: ClientScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ClientCountAggregateInputType | true
    _avg?: ClientAvgAggregateInputType
    _sum?: ClientSumAggregateInputType
    _min?: ClientMinAggregateInputType
    _max?: ClientMaxAggregateInputType
  }

  export type ClientGroupByOutputType = {
    id: string
    name: string
    email: string
    cpfCnpj: string
    phone: string | null
    address: string | null
    avgEnergyCost: number | null
    enelInvoiceFile: string | null
    soloCoinBalance: number
    indicationCode: string
    status: $Enums.ClientStatus
    createdAt: Date
    updatedAt: Date
    deletedAt: Date | null
    _count: ClientCountAggregateOutputType | null
    _avg: ClientAvgAggregateOutputType | null
    _sum: ClientSumAggregateOutputType | null
    _min: ClientMinAggregateOutputType | null
    _max: ClientMaxAggregateOutputType | null
  }

  type GetClientGroupByPayload<T extends ClientGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ClientGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ClientGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ClientGroupByOutputType[P]>
            : GetScalarType<T[P], ClientGroupByOutputType[P]>
        }
      >
    >


  export type ClientSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    email?: boolean
    cpfCnpj?: boolean
    phone?: boolean
    address?: boolean
    avgEnergyCost?: boolean
    enelInvoiceFile?: boolean
    soloCoinBalance?: boolean
    indicationCode?: boolean
    status?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    deletedAt?: boolean
    inverters?: boolean | Client$invertersArgs<ExtArgs>
    users?: boolean | Client$usersArgs<ExtArgs>
    indicationsAsReferrer?: boolean | Client$indicationsAsReferrerArgs<ExtArgs>
    indicationsAsReferred?: boolean | Client$indicationsAsReferredArgs<ExtArgs>
    transactions?: boolean | Client$transactionsArgs<ExtArgs>
    _count?: boolean | ClientCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["client"]>

  export type ClientSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    email?: boolean
    cpfCnpj?: boolean
    phone?: boolean
    address?: boolean
    avgEnergyCost?: boolean
    enelInvoiceFile?: boolean
    soloCoinBalance?: boolean
    indicationCode?: boolean
    status?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    deletedAt?: boolean
  }, ExtArgs["result"]["client"]>

  export type ClientSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    email?: boolean
    cpfCnpj?: boolean
    phone?: boolean
    address?: boolean
    avgEnergyCost?: boolean
    enelInvoiceFile?: boolean
    soloCoinBalance?: boolean
    indicationCode?: boolean
    status?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    deletedAt?: boolean
  }, ExtArgs["result"]["client"]>

  export type ClientSelectScalar = {
    id?: boolean
    name?: boolean
    email?: boolean
    cpfCnpj?: boolean
    phone?: boolean
    address?: boolean
    avgEnergyCost?: boolean
    enelInvoiceFile?: boolean
    soloCoinBalance?: boolean
    indicationCode?: boolean
    status?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    deletedAt?: boolean
  }

  export type ClientOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "email" | "cpfCnpj" | "phone" | "address" | "avgEnergyCost" | "enelInvoiceFile" | "soloCoinBalance" | "indicationCode" | "status" | "createdAt" | "updatedAt" | "deletedAt", ExtArgs["result"]["client"]>
  export type ClientInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    inverters?: boolean | Client$invertersArgs<ExtArgs>
    users?: boolean | Client$usersArgs<ExtArgs>
    indicationsAsReferrer?: boolean | Client$indicationsAsReferrerArgs<ExtArgs>
    indicationsAsReferred?: boolean | Client$indicationsAsReferredArgs<ExtArgs>
    transactions?: boolean | Client$transactionsArgs<ExtArgs>
    _count?: boolean | ClientCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type ClientIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type ClientIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $ClientPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Client"
    objects: {
      inverters: Prisma.$InverterPayload<ExtArgs>[]
      users: Prisma.$UserPayload<ExtArgs>[]
      indicationsAsReferrer: Prisma.$IndicationPayload<ExtArgs>[]
      indicationsAsReferred: Prisma.$IndicationPayload<ExtArgs>[]
      transactions: Prisma.$TransactionPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      email: string
      cpfCnpj: string
      phone: string | null
      address: string | null
      avgEnergyCost: number | null
      enelInvoiceFile: string | null
      soloCoinBalance: number
      indicationCode: string
      status: $Enums.ClientStatus
      createdAt: Date
      updatedAt: Date
      deletedAt: Date | null
    }, ExtArgs["result"]["client"]>
    composites: {}
  }

  type ClientGetPayload<S extends boolean | null | undefined | ClientDefaultArgs> = $Result.GetResult<Prisma.$ClientPayload, S>

  type ClientCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ClientFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ClientCountAggregateInputType | true
    }

  export interface ClientDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Client'], meta: { name: 'Client' } }
    /**
     * Find zero or one Client that matches the filter.
     * @param {ClientFindUniqueArgs} args - Arguments to find a Client
     * @example
     * // Get one Client
     * const client = await prisma.client.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ClientFindUniqueArgs>(args: SelectSubset<T, ClientFindUniqueArgs<ExtArgs>>): Prisma__ClientClient<$Result.GetResult<Prisma.$ClientPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Client that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ClientFindUniqueOrThrowArgs} args - Arguments to find a Client
     * @example
     * // Get one Client
     * const client = await prisma.client.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ClientFindUniqueOrThrowArgs>(args: SelectSubset<T, ClientFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ClientClient<$Result.GetResult<Prisma.$ClientPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Client that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ClientFindFirstArgs} args - Arguments to find a Client
     * @example
     * // Get one Client
     * const client = await prisma.client.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ClientFindFirstArgs>(args?: SelectSubset<T, ClientFindFirstArgs<ExtArgs>>): Prisma__ClientClient<$Result.GetResult<Prisma.$ClientPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Client that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ClientFindFirstOrThrowArgs} args - Arguments to find a Client
     * @example
     * // Get one Client
     * const client = await prisma.client.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ClientFindFirstOrThrowArgs>(args?: SelectSubset<T, ClientFindFirstOrThrowArgs<ExtArgs>>): Prisma__ClientClient<$Result.GetResult<Prisma.$ClientPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Clients that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ClientFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Clients
     * const clients = await prisma.client.findMany()
     * 
     * // Get first 10 Clients
     * const clients = await prisma.client.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const clientWithIdOnly = await prisma.client.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ClientFindManyArgs>(args?: SelectSubset<T, ClientFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ClientPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Client.
     * @param {ClientCreateArgs} args - Arguments to create a Client.
     * @example
     * // Create one Client
     * const Client = await prisma.client.create({
     *   data: {
     *     // ... data to create a Client
     *   }
     * })
     * 
     */
    create<T extends ClientCreateArgs>(args: SelectSubset<T, ClientCreateArgs<ExtArgs>>): Prisma__ClientClient<$Result.GetResult<Prisma.$ClientPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Clients.
     * @param {ClientCreateManyArgs} args - Arguments to create many Clients.
     * @example
     * // Create many Clients
     * const client = await prisma.client.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ClientCreateManyArgs>(args?: SelectSubset<T, ClientCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Clients and returns the data saved in the database.
     * @param {ClientCreateManyAndReturnArgs} args - Arguments to create many Clients.
     * @example
     * // Create many Clients
     * const client = await prisma.client.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Clients and only return the `id`
     * const clientWithIdOnly = await prisma.client.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ClientCreateManyAndReturnArgs>(args?: SelectSubset<T, ClientCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ClientPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Client.
     * @param {ClientDeleteArgs} args - Arguments to delete one Client.
     * @example
     * // Delete one Client
     * const Client = await prisma.client.delete({
     *   where: {
     *     // ... filter to delete one Client
     *   }
     * })
     * 
     */
    delete<T extends ClientDeleteArgs>(args: SelectSubset<T, ClientDeleteArgs<ExtArgs>>): Prisma__ClientClient<$Result.GetResult<Prisma.$ClientPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Client.
     * @param {ClientUpdateArgs} args - Arguments to update one Client.
     * @example
     * // Update one Client
     * const client = await prisma.client.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ClientUpdateArgs>(args: SelectSubset<T, ClientUpdateArgs<ExtArgs>>): Prisma__ClientClient<$Result.GetResult<Prisma.$ClientPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Clients.
     * @param {ClientDeleteManyArgs} args - Arguments to filter Clients to delete.
     * @example
     * // Delete a few Clients
     * const { count } = await prisma.client.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ClientDeleteManyArgs>(args?: SelectSubset<T, ClientDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Clients.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ClientUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Clients
     * const client = await prisma.client.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ClientUpdateManyArgs>(args: SelectSubset<T, ClientUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Clients and returns the data updated in the database.
     * @param {ClientUpdateManyAndReturnArgs} args - Arguments to update many Clients.
     * @example
     * // Update many Clients
     * const client = await prisma.client.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Clients and only return the `id`
     * const clientWithIdOnly = await prisma.client.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends ClientUpdateManyAndReturnArgs>(args: SelectSubset<T, ClientUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ClientPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Client.
     * @param {ClientUpsertArgs} args - Arguments to update or create a Client.
     * @example
     * // Update or create a Client
     * const client = await prisma.client.upsert({
     *   create: {
     *     // ... data to create a Client
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Client we want to update
     *   }
     * })
     */
    upsert<T extends ClientUpsertArgs>(args: SelectSubset<T, ClientUpsertArgs<ExtArgs>>): Prisma__ClientClient<$Result.GetResult<Prisma.$ClientPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Clients.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ClientCountArgs} args - Arguments to filter Clients to count.
     * @example
     * // Count the number of Clients
     * const count = await prisma.client.count({
     *   where: {
     *     // ... the filter for the Clients we want to count
     *   }
     * })
    **/
    count<T extends ClientCountArgs>(
      args?: Subset<T, ClientCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ClientCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Client.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ClientAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ClientAggregateArgs>(args: Subset<T, ClientAggregateArgs>): Prisma.PrismaPromise<GetClientAggregateType<T>>

    /**
     * Group by Client.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ClientGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ClientGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ClientGroupByArgs['orderBy'] }
        : { orderBy?: ClientGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ClientGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetClientGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Client model
   */
  readonly fields: ClientFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Client.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ClientClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    inverters<T extends Client$invertersArgs<ExtArgs> = {}>(args?: Subset<T, Client$invertersArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$InverterPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    users<T extends Client$usersArgs<ExtArgs> = {}>(args?: Subset<T, Client$usersArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    indicationsAsReferrer<T extends Client$indicationsAsReferrerArgs<ExtArgs> = {}>(args?: Subset<T, Client$indicationsAsReferrerArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$IndicationPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    indicationsAsReferred<T extends Client$indicationsAsReferredArgs<ExtArgs> = {}>(args?: Subset<T, Client$indicationsAsReferredArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$IndicationPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    transactions<T extends Client$transactionsArgs<ExtArgs> = {}>(args?: Subset<T, Client$transactionsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TransactionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Client model
   */
  interface ClientFieldRefs {
    readonly id: FieldRef<"Client", 'String'>
    readonly name: FieldRef<"Client", 'String'>
    readonly email: FieldRef<"Client", 'String'>
    readonly cpfCnpj: FieldRef<"Client", 'String'>
    readonly phone: FieldRef<"Client", 'String'>
    readonly address: FieldRef<"Client", 'String'>
    readonly avgEnergyCost: FieldRef<"Client", 'Float'>
    readonly enelInvoiceFile: FieldRef<"Client", 'String'>
    readonly soloCoinBalance: FieldRef<"Client", 'Float'>
    readonly indicationCode: FieldRef<"Client", 'String'>
    readonly status: FieldRef<"Client", 'ClientStatus'>
    readonly createdAt: FieldRef<"Client", 'DateTime'>
    readonly updatedAt: FieldRef<"Client", 'DateTime'>
    readonly deletedAt: FieldRef<"Client", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Client findUnique
   */
  export type ClientFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Client
     */
    select?: ClientSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Client
     */
    omit?: ClientOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClientInclude<ExtArgs> | null
    /**
     * Filter, which Client to fetch.
     */
    where: ClientWhereUniqueInput
  }

  /**
   * Client findUniqueOrThrow
   */
  export type ClientFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Client
     */
    select?: ClientSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Client
     */
    omit?: ClientOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClientInclude<ExtArgs> | null
    /**
     * Filter, which Client to fetch.
     */
    where: ClientWhereUniqueInput
  }

  /**
   * Client findFirst
   */
  export type ClientFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Client
     */
    select?: ClientSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Client
     */
    omit?: ClientOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClientInclude<ExtArgs> | null
    /**
     * Filter, which Client to fetch.
     */
    where?: ClientWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Clients to fetch.
     */
    orderBy?: ClientOrderByWithRelationInput | ClientOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Clients.
     */
    cursor?: ClientWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Clients from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Clients.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Clients.
     */
    distinct?: ClientScalarFieldEnum | ClientScalarFieldEnum[]
  }

  /**
   * Client findFirstOrThrow
   */
  export type ClientFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Client
     */
    select?: ClientSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Client
     */
    omit?: ClientOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClientInclude<ExtArgs> | null
    /**
     * Filter, which Client to fetch.
     */
    where?: ClientWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Clients to fetch.
     */
    orderBy?: ClientOrderByWithRelationInput | ClientOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Clients.
     */
    cursor?: ClientWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Clients from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Clients.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Clients.
     */
    distinct?: ClientScalarFieldEnum | ClientScalarFieldEnum[]
  }

  /**
   * Client findMany
   */
  export type ClientFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Client
     */
    select?: ClientSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Client
     */
    omit?: ClientOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClientInclude<ExtArgs> | null
    /**
     * Filter, which Clients to fetch.
     */
    where?: ClientWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Clients to fetch.
     */
    orderBy?: ClientOrderByWithRelationInput | ClientOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Clients.
     */
    cursor?: ClientWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Clients from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Clients.
     */
    skip?: number
    distinct?: ClientScalarFieldEnum | ClientScalarFieldEnum[]
  }

  /**
   * Client create
   */
  export type ClientCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Client
     */
    select?: ClientSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Client
     */
    omit?: ClientOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClientInclude<ExtArgs> | null
    /**
     * The data needed to create a Client.
     */
    data: XOR<ClientCreateInput, ClientUncheckedCreateInput>
  }

  /**
   * Client createMany
   */
  export type ClientCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Clients.
     */
    data: ClientCreateManyInput | ClientCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Client createManyAndReturn
   */
  export type ClientCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Client
     */
    select?: ClientSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Client
     */
    omit?: ClientOmit<ExtArgs> | null
    /**
     * The data used to create many Clients.
     */
    data: ClientCreateManyInput | ClientCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Client update
   */
  export type ClientUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Client
     */
    select?: ClientSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Client
     */
    omit?: ClientOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClientInclude<ExtArgs> | null
    /**
     * The data needed to update a Client.
     */
    data: XOR<ClientUpdateInput, ClientUncheckedUpdateInput>
    /**
     * Choose, which Client to update.
     */
    where: ClientWhereUniqueInput
  }

  /**
   * Client updateMany
   */
  export type ClientUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Clients.
     */
    data: XOR<ClientUpdateManyMutationInput, ClientUncheckedUpdateManyInput>
    /**
     * Filter which Clients to update
     */
    where?: ClientWhereInput
    /**
     * Limit how many Clients to update.
     */
    limit?: number
  }

  /**
   * Client updateManyAndReturn
   */
  export type ClientUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Client
     */
    select?: ClientSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Client
     */
    omit?: ClientOmit<ExtArgs> | null
    /**
     * The data used to update Clients.
     */
    data: XOR<ClientUpdateManyMutationInput, ClientUncheckedUpdateManyInput>
    /**
     * Filter which Clients to update
     */
    where?: ClientWhereInput
    /**
     * Limit how many Clients to update.
     */
    limit?: number
  }

  /**
   * Client upsert
   */
  export type ClientUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Client
     */
    select?: ClientSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Client
     */
    omit?: ClientOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClientInclude<ExtArgs> | null
    /**
     * The filter to search for the Client to update in case it exists.
     */
    where: ClientWhereUniqueInput
    /**
     * In case the Client found by the `where` argument doesn't exist, create a new Client with this data.
     */
    create: XOR<ClientCreateInput, ClientUncheckedCreateInput>
    /**
     * In case the Client was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ClientUpdateInput, ClientUncheckedUpdateInput>
  }

  /**
   * Client delete
   */
  export type ClientDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Client
     */
    select?: ClientSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Client
     */
    omit?: ClientOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClientInclude<ExtArgs> | null
    /**
     * Filter which Client to delete.
     */
    where: ClientWhereUniqueInput
  }

  /**
   * Client deleteMany
   */
  export type ClientDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Clients to delete
     */
    where?: ClientWhereInput
    /**
     * Limit how many Clients to delete.
     */
    limit?: number
  }

  /**
   * Client.inverters
   */
  export type Client$invertersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Inverter
     */
    select?: InverterSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Inverter
     */
    omit?: InverterOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InverterInclude<ExtArgs> | null
    where?: InverterWhereInput
    orderBy?: InverterOrderByWithRelationInput | InverterOrderByWithRelationInput[]
    cursor?: InverterWhereUniqueInput
    take?: number
    skip?: number
    distinct?: InverterScalarFieldEnum | InverterScalarFieldEnum[]
  }

  /**
   * Client.users
   */
  export type Client$usersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    where?: UserWhereInput
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    cursor?: UserWhereUniqueInput
    take?: number
    skip?: number
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * Client.indicationsAsReferrer
   */
  export type Client$indicationsAsReferrerArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Indication
     */
    select?: IndicationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Indication
     */
    omit?: IndicationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IndicationInclude<ExtArgs> | null
    where?: IndicationWhereInput
    orderBy?: IndicationOrderByWithRelationInput | IndicationOrderByWithRelationInput[]
    cursor?: IndicationWhereUniqueInput
    take?: number
    skip?: number
    distinct?: IndicationScalarFieldEnum | IndicationScalarFieldEnum[]
  }

  /**
   * Client.indicationsAsReferred
   */
  export type Client$indicationsAsReferredArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Indication
     */
    select?: IndicationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Indication
     */
    omit?: IndicationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IndicationInclude<ExtArgs> | null
    where?: IndicationWhereInput
    orderBy?: IndicationOrderByWithRelationInput | IndicationOrderByWithRelationInput[]
    cursor?: IndicationWhereUniqueInput
    take?: number
    skip?: number
    distinct?: IndicationScalarFieldEnum | IndicationScalarFieldEnum[]
  }

  /**
   * Client.transactions
   */
  export type Client$transactionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Transaction
     */
    select?: TransactionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Transaction
     */
    omit?: TransactionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionInclude<ExtArgs> | null
    where?: TransactionWhereInput
    orderBy?: TransactionOrderByWithRelationInput | TransactionOrderByWithRelationInput[]
    cursor?: TransactionWhereUniqueInput
    take?: number
    skip?: number
    distinct?: TransactionScalarFieldEnum | TransactionScalarFieldEnum[]
  }

  /**
   * Client without action
   */
  export type ClientDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Client
     */
    select?: ClientSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Client
     */
    omit?: ClientOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClientInclude<ExtArgs> | null
  }


  /**
   * Model Inverter
   */

  export type AggregateInverter = {
    _count: InverterCountAggregateOutputType | null
    _min: InverterMinAggregateOutputType | null
    _max: InverterMaxAggregateOutputType | null
  }

  export type InverterMinAggregateOutputType = {
    id: string | null
    provider: string | null
    providerId: string | null
    providerApiKey: string | null
    providerApiSecret: string | null
    providerUrl: string | null
    clientId: string | null
    createdAt: Date | null
    updatedAt: Date | null
    deletedAt: Date | null
  }

  export type InverterMaxAggregateOutputType = {
    id: string | null
    provider: string | null
    providerId: string | null
    providerApiKey: string | null
    providerApiSecret: string | null
    providerUrl: string | null
    clientId: string | null
    createdAt: Date | null
    updatedAt: Date | null
    deletedAt: Date | null
  }

  export type InverterCountAggregateOutputType = {
    id: number
    provider: number
    providerId: number
    providerApiKey: number
    providerApiSecret: number
    providerUrl: number
    clientId: number
    createdAt: number
    updatedAt: number
    deletedAt: number
    _all: number
  }


  export type InverterMinAggregateInputType = {
    id?: true
    provider?: true
    providerId?: true
    providerApiKey?: true
    providerApiSecret?: true
    providerUrl?: true
    clientId?: true
    createdAt?: true
    updatedAt?: true
    deletedAt?: true
  }

  export type InverterMaxAggregateInputType = {
    id?: true
    provider?: true
    providerId?: true
    providerApiKey?: true
    providerApiSecret?: true
    providerUrl?: true
    clientId?: true
    createdAt?: true
    updatedAt?: true
    deletedAt?: true
  }

  export type InverterCountAggregateInputType = {
    id?: true
    provider?: true
    providerId?: true
    providerApiKey?: true
    providerApiSecret?: true
    providerUrl?: true
    clientId?: true
    createdAt?: true
    updatedAt?: true
    deletedAt?: true
    _all?: true
  }

  export type InverterAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Inverter to aggregate.
     */
    where?: InverterWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Inverters to fetch.
     */
    orderBy?: InverterOrderByWithRelationInput | InverterOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: InverterWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Inverters from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Inverters.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Inverters
    **/
    _count?: true | InverterCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: InverterMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: InverterMaxAggregateInputType
  }

  export type GetInverterAggregateType<T extends InverterAggregateArgs> = {
        [P in keyof T & keyof AggregateInverter]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateInverter[P]>
      : GetScalarType<T[P], AggregateInverter[P]>
  }




  export type InverterGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: InverterWhereInput
    orderBy?: InverterOrderByWithAggregationInput | InverterOrderByWithAggregationInput[]
    by: InverterScalarFieldEnum[] | InverterScalarFieldEnum
    having?: InverterScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: InverterCountAggregateInputType | true
    _min?: InverterMinAggregateInputType
    _max?: InverterMaxAggregateInputType
  }

  export type InverterGroupByOutputType = {
    id: string
    provider: string
    providerId: string
    providerApiKey: string | null
    providerApiSecret: string | null
    providerUrl: string | null
    clientId: string
    createdAt: Date
    updatedAt: Date
    deletedAt: Date | null
    _count: InverterCountAggregateOutputType | null
    _min: InverterMinAggregateOutputType | null
    _max: InverterMaxAggregateOutputType | null
  }

  type GetInverterGroupByPayload<T extends InverterGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<InverterGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof InverterGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], InverterGroupByOutputType[P]>
            : GetScalarType<T[P], InverterGroupByOutputType[P]>
        }
      >
    >


  export type InverterSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    provider?: boolean
    providerId?: boolean
    providerApiKey?: boolean
    providerApiSecret?: boolean
    providerUrl?: boolean
    clientId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    deletedAt?: boolean
    client?: boolean | ClientDefaultArgs<ExtArgs>
    generationUnits?: boolean | Inverter$generationUnitsArgs<ExtArgs>
    _count?: boolean | InverterCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["inverter"]>

  export type InverterSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    provider?: boolean
    providerId?: boolean
    providerApiKey?: boolean
    providerApiSecret?: boolean
    providerUrl?: boolean
    clientId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    deletedAt?: boolean
    client?: boolean | ClientDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["inverter"]>

  export type InverterSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    provider?: boolean
    providerId?: boolean
    providerApiKey?: boolean
    providerApiSecret?: boolean
    providerUrl?: boolean
    clientId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    deletedAt?: boolean
    client?: boolean | ClientDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["inverter"]>

  export type InverterSelectScalar = {
    id?: boolean
    provider?: boolean
    providerId?: boolean
    providerApiKey?: boolean
    providerApiSecret?: boolean
    providerUrl?: boolean
    clientId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    deletedAt?: boolean
  }

  export type InverterOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "provider" | "providerId" | "providerApiKey" | "providerApiSecret" | "providerUrl" | "clientId" | "createdAt" | "updatedAt" | "deletedAt", ExtArgs["result"]["inverter"]>
  export type InverterInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    client?: boolean | ClientDefaultArgs<ExtArgs>
    generationUnits?: boolean | Inverter$generationUnitsArgs<ExtArgs>
    _count?: boolean | InverterCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type InverterIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    client?: boolean | ClientDefaultArgs<ExtArgs>
  }
  export type InverterIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    client?: boolean | ClientDefaultArgs<ExtArgs>
  }

  export type $InverterPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Inverter"
    objects: {
      client: Prisma.$ClientPayload<ExtArgs>
      generationUnits: Prisma.$GenerationUnitPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      provider: string
      providerId: string
      providerApiKey: string | null
      providerApiSecret: string | null
      providerUrl: string | null
      clientId: string
      createdAt: Date
      updatedAt: Date
      deletedAt: Date | null
    }, ExtArgs["result"]["inverter"]>
    composites: {}
  }

  type InverterGetPayload<S extends boolean | null | undefined | InverterDefaultArgs> = $Result.GetResult<Prisma.$InverterPayload, S>

  type InverterCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<InverterFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: InverterCountAggregateInputType | true
    }

  export interface InverterDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Inverter'], meta: { name: 'Inverter' } }
    /**
     * Find zero or one Inverter that matches the filter.
     * @param {InverterFindUniqueArgs} args - Arguments to find a Inverter
     * @example
     * // Get one Inverter
     * const inverter = await prisma.inverter.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends InverterFindUniqueArgs>(args: SelectSubset<T, InverterFindUniqueArgs<ExtArgs>>): Prisma__InverterClient<$Result.GetResult<Prisma.$InverterPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Inverter that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {InverterFindUniqueOrThrowArgs} args - Arguments to find a Inverter
     * @example
     * // Get one Inverter
     * const inverter = await prisma.inverter.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends InverterFindUniqueOrThrowArgs>(args: SelectSubset<T, InverterFindUniqueOrThrowArgs<ExtArgs>>): Prisma__InverterClient<$Result.GetResult<Prisma.$InverterPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Inverter that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InverterFindFirstArgs} args - Arguments to find a Inverter
     * @example
     * // Get one Inverter
     * const inverter = await prisma.inverter.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends InverterFindFirstArgs>(args?: SelectSubset<T, InverterFindFirstArgs<ExtArgs>>): Prisma__InverterClient<$Result.GetResult<Prisma.$InverterPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Inverter that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InverterFindFirstOrThrowArgs} args - Arguments to find a Inverter
     * @example
     * // Get one Inverter
     * const inverter = await prisma.inverter.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends InverterFindFirstOrThrowArgs>(args?: SelectSubset<T, InverterFindFirstOrThrowArgs<ExtArgs>>): Prisma__InverterClient<$Result.GetResult<Prisma.$InverterPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Inverters that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InverterFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Inverters
     * const inverters = await prisma.inverter.findMany()
     * 
     * // Get first 10 Inverters
     * const inverters = await prisma.inverter.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const inverterWithIdOnly = await prisma.inverter.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends InverterFindManyArgs>(args?: SelectSubset<T, InverterFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$InverterPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Inverter.
     * @param {InverterCreateArgs} args - Arguments to create a Inverter.
     * @example
     * // Create one Inverter
     * const Inverter = await prisma.inverter.create({
     *   data: {
     *     // ... data to create a Inverter
     *   }
     * })
     * 
     */
    create<T extends InverterCreateArgs>(args: SelectSubset<T, InverterCreateArgs<ExtArgs>>): Prisma__InverterClient<$Result.GetResult<Prisma.$InverterPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Inverters.
     * @param {InverterCreateManyArgs} args - Arguments to create many Inverters.
     * @example
     * // Create many Inverters
     * const inverter = await prisma.inverter.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends InverterCreateManyArgs>(args?: SelectSubset<T, InverterCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Inverters and returns the data saved in the database.
     * @param {InverterCreateManyAndReturnArgs} args - Arguments to create many Inverters.
     * @example
     * // Create many Inverters
     * const inverter = await prisma.inverter.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Inverters and only return the `id`
     * const inverterWithIdOnly = await prisma.inverter.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends InverterCreateManyAndReturnArgs>(args?: SelectSubset<T, InverterCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$InverterPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Inverter.
     * @param {InverterDeleteArgs} args - Arguments to delete one Inverter.
     * @example
     * // Delete one Inverter
     * const Inverter = await prisma.inverter.delete({
     *   where: {
     *     // ... filter to delete one Inverter
     *   }
     * })
     * 
     */
    delete<T extends InverterDeleteArgs>(args: SelectSubset<T, InverterDeleteArgs<ExtArgs>>): Prisma__InverterClient<$Result.GetResult<Prisma.$InverterPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Inverter.
     * @param {InverterUpdateArgs} args - Arguments to update one Inverter.
     * @example
     * // Update one Inverter
     * const inverter = await prisma.inverter.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends InverterUpdateArgs>(args: SelectSubset<T, InverterUpdateArgs<ExtArgs>>): Prisma__InverterClient<$Result.GetResult<Prisma.$InverterPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Inverters.
     * @param {InverterDeleteManyArgs} args - Arguments to filter Inverters to delete.
     * @example
     * // Delete a few Inverters
     * const { count } = await prisma.inverter.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends InverterDeleteManyArgs>(args?: SelectSubset<T, InverterDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Inverters.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InverterUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Inverters
     * const inverter = await prisma.inverter.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends InverterUpdateManyArgs>(args: SelectSubset<T, InverterUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Inverters and returns the data updated in the database.
     * @param {InverterUpdateManyAndReturnArgs} args - Arguments to update many Inverters.
     * @example
     * // Update many Inverters
     * const inverter = await prisma.inverter.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Inverters and only return the `id`
     * const inverterWithIdOnly = await prisma.inverter.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends InverterUpdateManyAndReturnArgs>(args: SelectSubset<T, InverterUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$InverterPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Inverter.
     * @param {InverterUpsertArgs} args - Arguments to update or create a Inverter.
     * @example
     * // Update or create a Inverter
     * const inverter = await prisma.inverter.upsert({
     *   create: {
     *     // ... data to create a Inverter
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Inverter we want to update
     *   }
     * })
     */
    upsert<T extends InverterUpsertArgs>(args: SelectSubset<T, InverterUpsertArgs<ExtArgs>>): Prisma__InverterClient<$Result.GetResult<Prisma.$InverterPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Inverters.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InverterCountArgs} args - Arguments to filter Inverters to count.
     * @example
     * // Count the number of Inverters
     * const count = await prisma.inverter.count({
     *   where: {
     *     // ... the filter for the Inverters we want to count
     *   }
     * })
    **/
    count<T extends InverterCountArgs>(
      args?: Subset<T, InverterCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], InverterCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Inverter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InverterAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends InverterAggregateArgs>(args: Subset<T, InverterAggregateArgs>): Prisma.PrismaPromise<GetInverterAggregateType<T>>

    /**
     * Group by Inverter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InverterGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends InverterGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: InverterGroupByArgs['orderBy'] }
        : { orderBy?: InverterGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, InverterGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetInverterGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Inverter model
   */
  readonly fields: InverterFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Inverter.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__InverterClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    client<T extends ClientDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ClientDefaultArgs<ExtArgs>>): Prisma__ClientClient<$Result.GetResult<Prisma.$ClientPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    generationUnits<T extends Inverter$generationUnitsArgs<ExtArgs> = {}>(args?: Subset<T, Inverter$generationUnitsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$GenerationUnitPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Inverter model
   */
  interface InverterFieldRefs {
    readonly id: FieldRef<"Inverter", 'String'>
    readonly provider: FieldRef<"Inverter", 'String'>
    readonly providerId: FieldRef<"Inverter", 'String'>
    readonly providerApiKey: FieldRef<"Inverter", 'String'>
    readonly providerApiSecret: FieldRef<"Inverter", 'String'>
    readonly providerUrl: FieldRef<"Inverter", 'String'>
    readonly clientId: FieldRef<"Inverter", 'String'>
    readonly createdAt: FieldRef<"Inverter", 'DateTime'>
    readonly updatedAt: FieldRef<"Inverter", 'DateTime'>
    readonly deletedAt: FieldRef<"Inverter", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Inverter findUnique
   */
  export type InverterFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Inverter
     */
    select?: InverterSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Inverter
     */
    omit?: InverterOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InverterInclude<ExtArgs> | null
    /**
     * Filter, which Inverter to fetch.
     */
    where: InverterWhereUniqueInput
  }

  /**
   * Inverter findUniqueOrThrow
   */
  export type InverterFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Inverter
     */
    select?: InverterSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Inverter
     */
    omit?: InverterOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InverterInclude<ExtArgs> | null
    /**
     * Filter, which Inverter to fetch.
     */
    where: InverterWhereUniqueInput
  }

  /**
   * Inverter findFirst
   */
  export type InverterFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Inverter
     */
    select?: InverterSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Inverter
     */
    omit?: InverterOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InverterInclude<ExtArgs> | null
    /**
     * Filter, which Inverter to fetch.
     */
    where?: InverterWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Inverters to fetch.
     */
    orderBy?: InverterOrderByWithRelationInput | InverterOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Inverters.
     */
    cursor?: InverterWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Inverters from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Inverters.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Inverters.
     */
    distinct?: InverterScalarFieldEnum | InverterScalarFieldEnum[]
  }

  /**
   * Inverter findFirstOrThrow
   */
  export type InverterFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Inverter
     */
    select?: InverterSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Inverter
     */
    omit?: InverterOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InverterInclude<ExtArgs> | null
    /**
     * Filter, which Inverter to fetch.
     */
    where?: InverterWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Inverters to fetch.
     */
    orderBy?: InverterOrderByWithRelationInput | InverterOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Inverters.
     */
    cursor?: InverterWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Inverters from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Inverters.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Inverters.
     */
    distinct?: InverterScalarFieldEnum | InverterScalarFieldEnum[]
  }

  /**
   * Inverter findMany
   */
  export type InverterFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Inverter
     */
    select?: InverterSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Inverter
     */
    omit?: InverterOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InverterInclude<ExtArgs> | null
    /**
     * Filter, which Inverters to fetch.
     */
    where?: InverterWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Inverters to fetch.
     */
    orderBy?: InverterOrderByWithRelationInput | InverterOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Inverters.
     */
    cursor?: InverterWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Inverters from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Inverters.
     */
    skip?: number
    distinct?: InverterScalarFieldEnum | InverterScalarFieldEnum[]
  }

  /**
   * Inverter create
   */
  export type InverterCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Inverter
     */
    select?: InverterSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Inverter
     */
    omit?: InverterOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InverterInclude<ExtArgs> | null
    /**
     * The data needed to create a Inverter.
     */
    data: XOR<InverterCreateInput, InverterUncheckedCreateInput>
  }

  /**
   * Inverter createMany
   */
  export type InverterCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Inverters.
     */
    data: InverterCreateManyInput | InverterCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Inverter createManyAndReturn
   */
  export type InverterCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Inverter
     */
    select?: InverterSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Inverter
     */
    omit?: InverterOmit<ExtArgs> | null
    /**
     * The data used to create many Inverters.
     */
    data: InverterCreateManyInput | InverterCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InverterIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Inverter update
   */
  export type InverterUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Inverter
     */
    select?: InverterSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Inverter
     */
    omit?: InverterOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InverterInclude<ExtArgs> | null
    /**
     * The data needed to update a Inverter.
     */
    data: XOR<InverterUpdateInput, InverterUncheckedUpdateInput>
    /**
     * Choose, which Inverter to update.
     */
    where: InverterWhereUniqueInput
  }

  /**
   * Inverter updateMany
   */
  export type InverterUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Inverters.
     */
    data: XOR<InverterUpdateManyMutationInput, InverterUncheckedUpdateManyInput>
    /**
     * Filter which Inverters to update
     */
    where?: InverterWhereInput
    /**
     * Limit how many Inverters to update.
     */
    limit?: number
  }

  /**
   * Inverter updateManyAndReturn
   */
  export type InverterUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Inverter
     */
    select?: InverterSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Inverter
     */
    omit?: InverterOmit<ExtArgs> | null
    /**
     * The data used to update Inverters.
     */
    data: XOR<InverterUpdateManyMutationInput, InverterUncheckedUpdateManyInput>
    /**
     * Filter which Inverters to update
     */
    where?: InverterWhereInput
    /**
     * Limit how many Inverters to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InverterIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Inverter upsert
   */
  export type InverterUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Inverter
     */
    select?: InverterSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Inverter
     */
    omit?: InverterOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InverterInclude<ExtArgs> | null
    /**
     * The filter to search for the Inverter to update in case it exists.
     */
    where: InverterWhereUniqueInput
    /**
     * In case the Inverter found by the `where` argument doesn't exist, create a new Inverter with this data.
     */
    create: XOR<InverterCreateInput, InverterUncheckedCreateInput>
    /**
     * In case the Inverter was found with the provided `where` argument, update it with this data.
     */
    update: XOR<InverterUpdateInput, InverterUncheckedUpdateInput>
  }

  /**
   * Inverter delete
   */
  export type InverterDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Inverter
     */
    select?: InverterSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Inverter
     */
    omit?: InverterOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InverterInclude<ExtArgs> | null
    /**
     * Filter which Inverter to delete.
     */
    where: InverterWhereUniqueInput
  }

  /**
   * Inverter deleteMany
   */
  export type InverterDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Inverters to delete
     */
    where?: InverterWhereInput
    /**
     * Limit how many Inverters to delete.
     */
    limit?: number
  }

  /**
   * Inverter.generationUnits
   */
  export type Inverter$generationUnitsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GenerationUnit
     */
    select?: GenerationUnitSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GenerationUnit
     */
    omit?: GenerationUnitOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GenerationUnitInclude<ExtArgs> | null
    where?: GenerationUnitWhereInput
    orderBy?: GenerationUnitOrderByWithRelationInput | GenerationUnitOrderByWithRelationInput[]
    cursor?: GenerationUnitWhereUniqueInput
    take?: number
    skip?: number
    distinct?: GenerationUnitScalarFieldEnum | GenerationUnitScalarFieldEnum[]
  }

  /**
   * Inverter without action
   */
  export type InverterDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Inverter
     */
    select?: InverterSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Inverter
     */
    omit?: InverterOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InverterInclude<ExtArgs> | null
  }


  /**
   * Model GenerationUnit
   */

  export type AggregateGenerationUnit = {
    _count: GenerationUnitCountAggregateOutputType | null
    _avg: GenerationUnitAvgAggregateOutputType | null
    _sum: GenerationUnitSumAggregateOutputType | null
    _min: GenerationUnitMinAggregateOutputType | null
    _max: GenerationUnitMaxAggregateOutputType | null
  }

  export type GenerationUnitAvgAggregateOutputType = {
    power: number | null
    energy: number | null
  }

  export type GenerationUnitSumAggregateOutputType = {
    power: number | null
    energy: number | null
  }

  export type GenerationUnitMinAggregateOutputType = {
    id: string | null
    power: number | null
    energy: number | null
    generationUnitType: string | null
    timestamp: Date | null
    inverterId: string | null
    createdAt: Date | null
    updatedAt: Date | null
    deletedAt: Date | null
  }

  export type GenerationUnitMaxAggregateOutputType = {
    id: string | null
    power: number | null
    energy: number | null
    generationUnitType: string | null
    timestamp: Date | null
    inverterId: string | null
    createdAt: Date | null
    updatedAt: Date | null
    deletedAt: Date | null
  }

  export type GenerationUnitCountAggregateOutputType = {
    id: number
    power: number
    energy: number
    generationUnitType: number
    timestamp: number
    inverterId: number
    createdAt: number
    updatedAt: number
    deletedAt: number
    _all: number
  }


  export type GenerationUnitAvgAggregateInputType = {
    power?: true
    energy?: true
  }

  export type GenerationUnitSumAggregateInputType = {
    power?: true
    energy?: true
  }

  export type GenerationUnitMinAggregateInputType = {
    id?: true
    power?: true
    energy?: true
    generationUnitType?: true
    timestamp?: true
    inverterId?: true
    createdAt?: true
    updatedAt?: true
    deletedAt?: true
  }

  export type GenerationUnitMaxAggregateInputType = {
    id?: true
    power?: true
    energy?: true
    generationUnitType?: true
    timestamp?: true
    inverterId?: true
    createdAt?: true
    updatedAt?: true
    deletedAt?: true
  }

  export type GenerationUnitCountAggregateInputType = {
    id?: true
    power?: true
    energy?: true
    generationUnitType?: true
    timestamp?: true
    inverterId?: true
    createdAt?: true
    updatedAt?: true
    deletedAt?: true
    _all?: true
  }

  export type GenerationUnitAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which GenerationUnit to aggregate.
     */
    where?: GenerationUnitWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of GenerationUnits to fetch.
     */
    orderBy?: GenerationUnitOrderByWithRelationInput | GenerationUnitOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: GenerationUnitWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` GenerationUnits from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` GenerationUnits.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned GenerationUnits
    **/
    _count?: true | GenerationUnitCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: GenerationUnitAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: GenerationUnitSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: GenerationUnitMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: GenerationUnitMaxAggregateInputType
  }

  export type GetGenerationUnitAggregateType<T extends GenerationUnitAggregateArgs> = {
        [P in keyof T & keyof AggregateGenerationUnit]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateGenerationUnit[P]>
      : GetScalarType<T[P], AggregateGenerationUnit[P]>
  }




  export type GenerationUnitGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: GenerationUnitWhereInput
    orderBy?: GenerationUnitOrderByWithAggregationInput | GenerationUnitOrderByWithAggregationInput[]
    by: GenerationUnitScalarFieldEnum[] | GenerationUnitScalarFieldEnum
    having?: GenerationUnitScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: GenerationUnitCountAggregateInputType | true
    _avg?: GenerationUnitAvgAggregateInputType
    _sum?: GenerationUnitSumAggregateInputType
    _min?: GenerationUnitMinAggregateInputType
    _max?: GenerationUnitMaxAggregateInputType
  }

  export type GenerationUnitGroupByOutputType = {
    id: string
    power: number
    energy: number
    generationUnitType: string
    timestamp: Date
    inverterId: string
    createdAt: Date
    updatedAt: Date
    deletedAt: Date | null
    _count: GenerationUnitCountAggregateOutputType | null
    _avg: GenerationUnitAvgAggregateOutputType | null
    _sum: GenerationUnitSumAggregateOutputType | null
    _min: GenerationUnitMinAggregateOutputType | null
    _max: GenerationUnitMaxAggregateOutputType | null
  }

  type GetGenerationUnitGroupByPayload<T extends GenerationUnitGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<GenerationUnitGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof GenerationUnitGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], GenerationUnitGroupByOutputType[P]>
            : GetScalarType<T[P], GenerationUnitGroupByOutputType[P]>
        }
      >
    >


  export type GenerationUnitSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    power?: boolean
    energy?: boolean
    generationUnitType?: boolean
    timestamp?: boolean
    inverterId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    deletedAt?: boolean
    inverter?: boolean | InverterDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["generationUnit"]>

  export type GenerationUnitSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    power?: boolean
    energy?: boolean
    generationUnitType?: boolean
    timestamp?: boolean
    inverterId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    deletedAt?: boolean
    inverter?: boolean | InverterDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["generationUnit"]>

  export type GenerationUnitSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    power?: boolean
    energy?: boolean
    generationUnitType?: boolean
    timestamp?: boolean
    inverterId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    deletedAt?: boolean
    inverter?: boolean | InverterDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["generationUnit"]>

  export type GenerationUnitSelectScalar = {
    id?: boolean
    power?: boolean
    energy?: boolean
    generationUnitType?: boolean
    timestamp?: boolean
    inverterId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    deletedAt?: boolean
  }

  export type GenerationUnitOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "power" | "energy" | "generationUnitType" | "timestamp" | "inverterId" | "createdAt" | "updatedAt" | "deletedAt", ExtArgs["result"]["generationUnit"]>
  export type GenerationUnitInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    inverter?: boolean | InverterDefaultArgs<ExtArgs>
  }
  export type GenerationUnitIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    inverter?: boolean | InverterDefaultArgs<ExtArgs>
  }
  export type GenerationUnitIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    inverter?: boolean | InverterDefaultArgs<ExtArgs>
  }

  export type $GenerationUnitPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "GenerationUnit"
    objects: {
      inverter: Prisma.$InverterPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      power: number
      energy: number
      generationUnitType: string
      timestamp: Date
      inverterId: string
      createdAt: Date
      updatedAt: Date
      deletedAt: Date | null
    }, ExtArgs["result"]["generationUnit"]>
    composites: {}
  }

  type GenerationUnitGetPayload<S extends boolean | null | undefined | GenerationUnitDefaultArgs> = $Result.GetResult<Prisma.$GenerationUnitPayload, S>

  type GenerationUnitCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<GenerationUnitFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: GenerationUnitCountAggregateInputType | true
    }

  export interface GenerationUnitDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['GenerationUnit'], meta: { name: 'GenerationUnit' } }
    /**
     * Find zero or one GenerationUnit that matches the filter.
     * @param {GenerationUnitFindUniqueArgs} args - Arguments to find a GenerationUnit
     * @example
     * // Get one GenerationUnit
     * const generationUnit = await prisma.generationUnit.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends GenerationUnitFindUniqueArgs>(args: SelectSubset<T, GenerationUnitFindUniqueArgs<ExtArgs>>): Prisma__GenerationUnitClient<$Result.GetResult<Prisma.$GenerationUnitPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one GenerationUnit that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {GenerationUnitFindUniqueOrThrowArgs} args - Arguments to find a GenerationUnit
     * @example
     * // Get one GenerationUnit
     * const generationUnit = await prisma.generationUnit.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends GenerationUnitFindUniqueOrThrowArgs>(args: SelectSubset<T, GenerationUnitFindUniqueOrThrowArgs<ExtArgs>>): Prisma__GenerationUnitClient<$Result.GetResult<Prisma.$GenerationUnitPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first GenerationUnit that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GenerationUnitFindFirstArgs} args - Arguments to find a GenerationUnit
     * @example
     * // Get one GenerationUnit
     * const generationUnit = await prisma.generationUnit.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends GenerationUnitFindFirstArgs>(args?: SelectSubset<T, GenerationUnitFindFirstArgs<ExtArgs>>): Prisma__GenerationUnitClient<$Result.GetResult<Prisma.$GenerationUnitPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first GenerationUnit that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GenerationUnitFindFirstOrThrowArgs} args - Arguments to find a GenerationUnit
     * @example
     * // Get one GenerationUnit
     * const generationUnit = await prisma.generationUnit.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends GenerationUnitFindFirstOrThrowArgs>(args?: SelectSubset<T, GenerationUnitFindFirstOrThrowArgs<ExtArgs>>): Prisma__GenerationUnitClient<$Result.GetResult<Prisma.$GenerationUnitPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more GenerationUnits that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GenerationUnitFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all GenerationUnits
     * const generationUnits = await prisma.generationUnit.findMany()
     * 
     * // Get first 10 GenerationUnits
     * const generationUnits = await prisma.generationUnit.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const generationUnitWithIdOnly = await prisma.generationUnit.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends GenerationUnitFindManyArgs>(args?: SelectSubset<T, GenerationUnitFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$GenerationUnitPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a GenerationUnit.
     * @param {GenerationUnitCreateArgs} args - Arguments to create a GenerationUnit.
     * @example
     * // Create one GenerationUnit
     * const GenerationUnit = await prisma.generationUnit.create({
     *   data: {
     *     // ... data to create a GenerationUnit
     *   }
     * })
     * 
     */
    create<T extends GenerationUnitCreateArgs>(args: SelectSubset<T, GenerationUnitCreateArgs<ExtArgs>>): Prisma__GenerationUnitClient<$Result.GetResult<Prisma.$GenerationUnitPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many GenerationUnits.
     * @param {GenerationUnitCreateManyArgs} args - Arguments to create many GenerationUnits.
     * @example
     * // Create many GenerationUnits
     * const generationUnit = await prisma.generationUnit.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends GenerationUnitCreateManyArgs>(args?: SelectSubset<T, GenerationUnitCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many GenerationUnits and returns the data saved in the database.
     * @param {GenerationUnitCreateManyAndReturnArgs} args - Arguments to create many GenerationUnits.
     * @example
     * // Create many GenerationUnits
     * const generationUnit = await prisma.generationUnit.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many GenerationUnits and only return the `id`
     * const generationUnitWithIdOnly = await prisma.generationUnit.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends GenerationUnitCreateManyAndReturnArgs>(args?: SelectSubset<T, GenerationUnitCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$GenerationUnitPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a GenerationUnit.
     * @param {GenerationUnitDeleteArgs} args - Arguments to delete one GenerationUnit.
     * @example
     * // Delete one GenerationUnit
     * const GenerationUnit = await prisma.generationUnit.delete({
     *   where: {
     *     // ... filter to delete one GenerationUnit
     *   }
     * })
     * 
     */
    delete<T extends GenerationUnitDeleteArgs>(args: SelectSubset<T, GenerationUnitDeleteArgs<ExtArgs>>): Prisma__GenerationUnitClient<$Result.GetResult<Prisma.$GenerationUnitPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one GenerationUnit.
     * @param {GenerationUnitUpdateArgs} args - Arguments to update one GenerationUnit.
     * @example
     * // Update one GenerationUnit
     * const generationUnit = await prisma.generationUnit.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends GenerationUnitUpdateArgs>(args: SelectSubset<T, GenerationUnitUpdateArgs<ExtArgs>>): Prisma__GenerationUnitClient<$Result.GetResult<Prisma.$GenerationUnitPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more GenerationUnits.
     * @param {GenerationUnitDeleteManyArgs} args - Arguments to filter GenerationUnits to delete.
     * @example
     * // Delete a few GenerationUnits
     * const { count } = await prisma.generationUnit.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends GenerationUnitDeleteManyArgs>(args?: SelectSubset<T, GenerationUnitDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more GenerationUnits.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GenerationUnitUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many GenerationUnits
     * const generationUnit = await prisma.generationUnit.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends GenerationUnitUpdateManyArgs>(args: SelectSubset<T, GenerationUnitUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more GenerationUnits and returns the data updated in the database.
     * @param {GenerationUnitUpdateManyAndReturnArgs} args - Arguments to update many GenerationUnits.
     * @example
     * // Update many GenerationUnits
     * const generationUnit = await prisma.generationUnit.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more GenerationUnits and only return the `id`
     * const generationUnitWithIdOnly = await prisma.generationUnit.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends GenerationUnitUpdateManyAndReturnArgs>(args: SelectSubset<T, GenerationUnitUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$GenerationUnitPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one GenerationUnit.
     * @param {GenerationUnitUpsertArgs} args - Arguments to update or create a GenerationUnit.
     * @example
     * // Update or create a GenerationUnit
     * const generationUnit = await prisma.generationUnit.upsert({
     *   create: {
     *     // ... data to create a GenerationUnit
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the GenerationUnit we want to update
     *   }
     * })
     */
    upsert<T extends GenerationUnitUpsertArgs>(args: SelectSubset<T, GenerationUnitUpsertArgs<ExtArgs>>): Prisma__GenerationUnitClient<$Result.GetResult<Prisma.$GenerationUnitPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of GenerationUnits.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GenerationUnitCountArgs} args - Arguments to filter GenerationUnits to count.
     * @example
     * // Count the number of GenerationUnits
     * const count = await prisma.generationUnit.count({
     *   where: {
     *     // ... the filter for the GenerationUnits we want to count
     *   }
     * })
    **/
    count<T extends GenerationUnitCountArgs>(
      args?: Subset<T, GenerationUnitCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], GenerationUnitCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a GenerationUnit.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GenerationUnitAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends GenerationUnitAggregateArgs>(args: Subset<T, GenerationUnitAggregateArgs>): Prisma.PrismaPromise<GetGenerationUnitAggregateType<T>>

    /**
     * Group by GenerationUnit.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GenerationUnitGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends GenerationUnitGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: GenerationUnitGroupByArgs['orderBy'] }
        : { orderBy?: GenerationUnitGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, GenerationUnitGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetGenerationUnitGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the GenerationUnit model
   */
  readonly fields: GenerationUnitFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for GenerationUnit.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__GenerationUnitClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    inverter<T extends InverterDefaultArgs<ExtArgs> = {}>(args?: Subset<T, InverterDefaultArgs<ExtArgs>>): Prisma__InverterClient<$Result.GetResult<Prisma.$InverterPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the GenerationUnit model
   */
  interface GenerationUnitFieldRefs {
    readonly id: FieldRef<"GenerationUnit", 'String'>
    readonly power: FieldRef<"GenerationUnit", 'Float'>
    readonly energy: FieldRef<"GenerationUnit", 'Float'>
    readonly generationUnitType: FieldRef<"GenerationUnit", 'String'>
    readonly timestamp: FieldRef<"GenerationUnit", 'DateTime'>
    readonly inverterId: FieldRef<"GenerationUnit", 'String'>
    readonly createdAt: FieldRef<"GenerationUnit", 'DateTime'>
    readonly updatedAt: FieldRef<"GenerationUnit", 'DateTime'>
    readonly deletedAt: FieldRef<"GenerationUnit", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * GenerationUnit findUnique
   */
  export type GenerationUnitFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GenerationUnit
     */
    select?: GenerationUnitSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GenerationUnit
     */
    omit?: GenerationUnitOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GenerationUnitInclude<ExtArgs> | null
    /**
     * Filter, which GenerationUnit to fetch.
     */
    where: GenerationUnitWhereUniqueInput
  }

  /**
   * GenerationUnit findUniqueOrThrow
   */
  export type GenerationUnitFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GenerationUnit
     */
    select?: GenerationUnitSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GenerationUnit
     */
    omit?: GenerationUnitOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GenerationUnitInclude<ExtArgs> | null
    /**
     * Filter, which GenerationUnit to fetch.
     */
    where: GenerationUnitWhereUniqueInput
  }

  /**
   * GenerationUnit findFirst
   */
  export type GenerationUnitFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GenerationUnit
     */
    select?: GenerationUnitSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GenerationUnit
     */
    omit?: GenerationUnitOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GenerationUnitInclude<ExtArgs> | null
    /**
     * Filter, which GenerationUnit to fetch.
     */
    where?: GenerationUnitWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of GenerationUnits to fetch.
     */
    orderBy?: GenerationUnitOrderByWithRelationInput | GenerationUnitOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for GenerationUnits.
     */
    cursor?: GenerationUnitWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` GenerationUnits from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` GenerationUnits.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of GenerationUnits.
     */
    distinct?: GenerationUnitScalarFieldEnum | GenerationUnitScalarFieldEnum[]
  }

  /**
   * GenerationUnit findFirstOrThrow
   */
  export type GenerationUnitFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GenerationUnit
     */
    select?: GenerationUnitSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GenerationUnit
     */
    omit?: GenerationUnitOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GenerationUnitInclude<ExtArgs> | null
    /**
     * Filter, which GenerationUnit to fetch.
     */
    where?: GenerationUnitWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of GenerationUnits to fetch.
     */
    orderBy?: GenerationUnitOrderByWithRelationInput | GenerationUnitOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for GenerationUnits.
     */
    cursor?: GenerationUnitWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` GenerationUnits from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` GenerationUnits.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of GenerationUnits.
     */
    distinct?: GenerationUnitScalarFieldEnum | GenerationUnitScalarFieldEnum[]
  }

  /**
   * GenerationUnit findMany
   */
  export type GenerationUnitFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GenerationUnit
     */
    select?: GenerationUnitSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GenerationUnit
     */
    omit?: GenerationUnitOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GenerationUnitInclude<ExtArgs> | null
    /**
     * Filter, which GenerationUnits to fetch.
     */
    where?: GenerationUnitWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of GenerationUnits to fetch.
     */
    orderBy?: GenerationUnitOrderByWithRelationInput | GenerationUnitOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing GenerationUnits.
     */
    cursor?: GenerationUnitWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` GenerationUnits from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` GenerationUnits.
     */
    skip?: number
    distinct?: GenerationUnitScalarFieldEnum | GenerationUnitScalarFieldEnum[]
  }

  /**
   * GenerationUnit create
   */
  export type GenerationUnitCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GenerationUnit
     */
    select?: GenerationUnitSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GenerationUnit
     */
    omit?: GenerationUnitOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GenerationUnitInclude<ExtArgs> | null
    /**
     * The data needed to create a GenerationUnit.
     */
    data: XOR<GenerationUnitCreateInput, GenerationUnitUncheckedCreateInput>
  }

  /**
   * GenerationUnit createMany
   */
  export type GenerationUnitCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many GenerationUnits.
     */
    data: GenerationUnitCreateManyInput | GenerationUnitCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * GenerationUnit createManyAndReturn
   */
  export type GenerationUnitCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GenerationUnit
     */
    select?: GenerationUnitSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the GenerationUnit
     */
    omit?: GenerationUnitOmit<ExtArgs> | null
    /**
     * The data used to create many GenerationUnits.
     */
    data: GenerationUnitCreateManyInput | GenerationUnitCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GenerationUnitIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * GenerationUnit update
   */
  export type GenerationUnitUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GenerationUnit
     */
    select?: GenerationUnitSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GenerationUnit
     */
    omit?: GenerationUnitOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GenerationUnitInclude<ExtArgs> | null
    /**
     * The data needed to update a GenerationUnit.
     */
    data: XOR<GenerationUnitUpdateInput, GenerationUnitUncheckedUpdateInput>
    /**
     * Choose, which GenerationUnit to update.
     */
    where: GenerationUnitWhereUniqueInput
  }

  /**
   * GenerationUnit updateMany
   */
  export type GenerationUnitUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update GenerationUnits.
     */
    data: XOR<GenerationUnitUpdateManyMutationInput, GenerationUnitUncheckedUpdateManyInput>
    /**
     * Filter which GenerationUnits to update
     */
    where?: GenerationUnitWhereInput
    /**
     * Limit how many GenerationUnits to update.
     */
    limit?: number
  }

  /**
   * GenerationUnit updateManyAndReturn
   */
  export type GenerationUnitUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GenerationUnit
     */
    select?: GenerationUnitSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the GenerationUnit
     */
    omit?: GenerationUnitOmit<ExtArgs> | null
    /**
     * The data used to update GenerationUnits.
     */
    data: XOR<GenerationUnitUpdateManyMutationInput, GenerationUnitUncheckedUpdateManyInput>
    /**
     * Filter which GenerationUnits to update
     */
    where?: GenerationUnitWhereInput
    /**
     * Limit how many GenerationUnits to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GenerationUnitIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * GenerationUnit upsert
   */
  export type GenerationUnitUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GenerationUnit
     */
    select?: GenerationUnitSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GenerationUnit
     */
    omit?: GenerationUnitOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GenerationUnitInclude<ExtArgs> | null
    /**
     * The filter to search for the GenerationUnit to update in case it exists.
     */
    where: GenerationUnitWhereUniqueInput
    /**
     * In case the GenerationUnit found by the `where` argument doesn't exist, create a new GenerationUnit with this data.
     */
    create: XOR<GenerationUnitCreateInput, GenerationUnitUncheckedCreateInput>
    /**
     * In case the GenerationUnit was found with the provided `where` argument, update it with this data.
     */
    update: XOR<GenerationUnitUpdateInput, GenerationUnitUncheckedUpdateInput>
  }

  /**
   * GenerationUnit delete
   */
  export type GenerationUnitDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GenerationUnit
     */
    select?: GenerationUnitSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GenerationUnit
     */
    omit?: GenerationUnitOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GenerationUnitInclude<ExtArgs> | null
    /**
     * Filter which GenerationUnit to delete.
     */
    where: GenerationUnitWhereUniqueInput
  }

  /**
   * GenerationUnit deleteMany
   */
  export type GenerationUnitDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which GenerationUnits to delete
     */
    where?: GenerationUnitWhereInput
    /**
     * Limit how many GenerationUnits to delete.
     */
    limit?: number
  }

  /**
   * GenerationUnit without action
   */
  export type GenerationUnitDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GenerationUnit
     */
    select?: GenerationUnitSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GenerationUnit
     */
    omit?: GenerationUnitOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GenerationUnitInclude<ExtArgs> | null
  }


  /**
   * Model Indication
   */

  export type AggregateIndication = {
    _count: IndicationCountAggregateOutputType | null
    _min: IndicationMinAggregateOutputType | null
    _max: IndicationMaxAggregateOutputType | null
  }

  export type IndicationMinAggregateOutputType = {
    id: string | null
    referrerId: string | null
    referredId: string | null
    status: $Enums.IndicationStatus | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type IndicationMaxAggregateOutputType = {
    id: string | null
    referrerId: string | null
    referredId: string | null
    status: $Enums.IndicationStatus | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type IndicationCountAggregateOutputType = {
    id: number
    referrerId: number
    referredId: number
    status: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type IndicationMinAggregateInputType = {
    id?: true
    referrerId?: true
    referredId?: true
    status?: true
    createdAt?: true
    updatedAt?: true
  }

  export type IndicationMaxAggregateInputType = {
    id?: true
    referrerId?: true
    referredId?: true
    status?: true
    createdAt?: true
    updatedAt?: true
  }

  export type IndicationCountAggregateInputType = {
    id?: true
    referrerId?: true
    referredId?: true
    status?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type IndicationAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Indication to aggregate.
     */
    where?: IndicationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Indications to fetch.
     */
    orderBy?: IndicationOrderByWithRelationInput | IndicationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: IndicationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Indications from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Indications.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Indications
    **/
    _count?: true | IndicationCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: IndicationMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: IndicationMaxAggregateInputType
  }

  export type GetIndicationAggregateType<T extends IndicationAggregateArgs> = {
        [P in keyof T & keyof AggregateIndication]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateIndication[P]>
      : GetScalarType<T[P], AggregateIndication[P]>
  }




  export type IndicationGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: IndicationWhereInput
    orderBy?: IndicationOrderByWithAggregationInput | IndicationOrderByWithAggregationInput[]
    by: IndicationScalarFieldEnum[] | IndicationScalarFieldEnum
    having?: IndicationScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: IndicationCountAggregateInputType | true
    _min?: IndicationMinAggregateInputType
    _max?: IndicationMaxAggregateInputType
  }

  export type IndicationGroupByOutputType = {
    id: string
    referrerId: string
    referredId: string
    status: $Enums.IndicationStatus
    createdAt: Date
    updatedAt: Date
    _count: IndicationCountAggregateOutputType | null
    _min: IndicationMinAggregateOutputType | null
    _max: IndicationMaxAggregateOutputType | null
  }

  type GetIndicationGroupByPayload<T extends IndicationGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<IndicationGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof IndicationGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], IndicationGroupByOutputType[P]>
            : GetScalarType<T[P], IndicationGroupByOutputType[P]>
        }
      >
    >


  export type IndicationSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    referrerId?: boolean
    referredId?: boolean
    status?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    referrer?: boolean | ClientDefaultArgs<ExtArgs>
    referred?: boolean | ClientDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["indication"]>

  export type IndicationSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    referrerId?: boolean
    referredId?: boolean
    status?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    referrer?: boolean | ClientDefaultArgs<ExtArgs>
    referred?: boolean | ClientDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["indication"]>

  export type IndicationSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    referrerId?: boolean
    referredId?: boolean
    status?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    referrer?: boolean | ClientDefaultArgs<ExtArgs>
    referred?: boolean | ClientDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["indication"]>

  export type IndicationSelectScalar = {
    id?: boolean
    referrerId?: boolean
    referredId?: boolean
    status?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type IndicationOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "referrerId" | "referredId" | "status" | "createdAt" | "updatedAt", ExtArgs["result"]["indication"]>
  export type IndicationInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    referrer?: boolean | ClientDefaultArgs<ExtArgs>
    referred?: boolean | ClientDefaultArgs<ExtArgs>
  }
  export type IndicationIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    referrer?: boolean | ClientDefaultArgs<ExtArgs>
    referred?: boolean | ClientDefaultArgs<ExtArgs>
  }
  export type IndicationIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    referrer?: boolean | ClientDefaultArgs<ExtArgs>
    referred?: boolean | ClientDefaultArgs<ExtArgs>
  }

  export type $IndicationPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Indication"
    objects: {
      referrer: Prisma.$ClientPayload<ExtArgs>
      referred: Prisma.$ClientPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      referrerId: string
      referredId: string
      status: $Enums.IndicationStatus
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["indication"]>
    composites: {}
  }

  type IndicationGetPayload<S extends boolean | null | undefined | IndicationDefaultArgs> = $Result.GetResult<Prisma.$IndicationPayload, S>

  type IndicationCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<IndicationFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: IndicationCountAggregateInputType | true
    }

  export interface IndicationDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Indication'], meta: { name: 'Indication' } }
    /**
     * Find zero or one Indication that matches the filter.
     * @param {IndicationFindUniqueArgs} args - Arguments to find a Indication
     * @example
     * // Get one Indication
     * const indication = await prisma.indication.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends IndicationFindUniqueArgs>(args: SelectSubset<T, IndicationFindUniqueArgs<ExtArgs>>): Prisma__IndicationClient<$Result.GetResult<Prisma.$IndicationPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Indication that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {IndicationFindUniqueOrThrowArgs} args - Arguments to find a Indication
     * @example
     * // Get one Indication
     * const indication = await prisma.indication.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends IndicationFindUniqueOrThrowArgs>(args: SelectSubset<T, IndicationFindUniqueOrThrowArgs<ExtArgs>>): Prisma__IndicationClient<$Result.GetResult<Prisma.$IndicationPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Indication that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IndicationFindFirstArgs} args - Arguments to find a Indication
     * @example
     * // Get one Indication
     * const indication = await prisma.indication.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends IndicationFindFirstArgs>(args?: SelectSubset<T, IndicationFindFirstArgs<ExtArgs>>): Prisma__IndicationClient<$Result.GetResult<Prisma.$IndicationPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Indication that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IndicationFindFirstOrThrowArgs} args - Arguments to find a Indication
     * @example
     * // Get one Indication
     * const indication = await prisma.indication.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends IndicationFindFirstOrThrowArgs>(args?: SelectSubset<T, IndicationFindFirstOrThrowArgs<ExtArgs>>): Prisma__IndicationClient<$Result.GetResult<Prisma.$IndicationPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Indications that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IndicationFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Indications
     * const indications = await prisma.indication.findMany()
     * 
     * // Get first 10 Indications
     * const indications = await prisma.indication.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const indicationWithIdOnly = await prisma.indication.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends IndicationFindManyArgs>(args?: SelectSubset<T, IndicationFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$IndicationPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Indication.
     * @param {IndicationCreateArgs} args - Arguments to create a Indication.
     * @example
     * // Create one Indication
     * const Indication = await prisma.indication.create({
     *   data: {
     *     // ... data to create a Indication
     *   }
     * })
     * 
     */
    create<T extends IndicationCreateArgs>(args: SelectSubset<T, IndicationCreateArgs<ExtArgs>>): Prisma__IndicationClient<$Result.GetResult<Prisma.$IndicationPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Indications.
     * @param {IndicationCreateManyArgs} args - Arguments to create many Indications.
     * @example
     * // Create many Indications
     * const indication = await prisma.indication.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends IndicationCreateManyArgs>(args?: SelectSubset<T, IndicationCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Indications and returns the data saved in the database.
     * @param {IndicationCreateManyAndReturnArgs} args - Arguments to create many Indications.
     * @example
     * // Create many Indications
     * const indication = await prisma.indication.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Indications and only return the `id`
     * const indicationWithIdOnly = await prisma.indication.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends IndicationCreateManyAndReturnArgs>(args?: SelectSubset<T, IndicationCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$IndicationPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Indication.
     * @param {IndicationDeleteArgs} args - Arguments to delete one Indication.
     * @example
     * // Delete one Indication
     * const Indication = await prisma.indication.delete({
     *   where: {
     *     // ... filter to delete one Indication
     *   }
     * })
     * 
     */
    delete<T extends IndicationDeleteArgs>(args: SelectSubset<T, IndicationDeleteArgs<ExtArgs>>): Prisma__IndicationClient<$Result.GetResult<Prisma.$IndicationPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Indication.
     * @param {IndicationUpdateArgs} args - Arguments to update one Indication.
     * @example
     * // Update one Indication
     * const indication = await prisma.indication.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends IndicationUpdateArgs>(args: SelectSubset<T, IndicationUpdateArgs<ExtArgs>>): Prisma__IndicationClient<$Result.GetResult<Prisma.$IndicationPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Indications.
     * @param {IndicationDeleteManyArgs} args - Arguments to filter Indications to delete.
     * @example
     * // Delete a few Indications
     * const { count } = await prisma.indication.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends IndicationDeleteManyArgs>(args?: SelectSubset<T, IndicationDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Indications.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IndicationUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Indications
     * const indication = await prisma.indication.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends IndicationUpdateManyArgs>(args: SelectSubset<T, IndicationUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Indications and returns the data updated in the database.
     * @param {IndicationUpdateManyAndReturnArgs} args - Arguments to update many Indications.
     * @example
     * // Update many Indications
     * const indication = await prisma.indication.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Indications and only return the `id`
     * const indicationWithIdOnly = await prisma.indication.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends IndicationUpdateManyAndReturnArgs>(args: SelectSubset<T, IndicationUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$IndicationPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Indication.
     * @param {IndicationUpsertArgs} args - Arguments to update or create a Indication.
     * @example
     * // Update or create a Indication
     * const indication = await prisma.indication.upsert({
     *   create: {
     *     // ... data to create a Indication
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Indication we want to update
     *   }
     * })
     */
    upsert<T extends IndicationUpsertArgs>(args: SelectSubset<T, IndicationUpsertArgs<ExtArgs>>): Prisma__IndicationClient<$Result.GetResult<Prisma.$IndicationPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Indications.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IndicationCountArgs} args - Arguments to filter Indications to count.
     * @example
     * // Count the number of Indications
     * const count = await prisma.indication.count({
     *   where: {
     *     // ... the filter for the Indications we want to count
     *   }
     * })
    **/
    count<T extends IndicationCountArgs>(
      args?: Subset<T, IndicationCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], IndicationCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Indication.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IndicationAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends IndicationAggregateArgs>(args: Subset<T, IndicationAggregateArgs>): Prisma.PrismaPromise<GetIndicationAggregateType<T>>

    /**
     * Group by Indication.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IndicationGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends IndicationGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: IndicationGroupByArgs['orderBy'] }
        : { orderBy?: IndicationGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, IndicationGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetIndicationGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Indication model
   */
  readonly fields: IndicationFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Indication.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__IndicationClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    referrer<T extends ClientDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ClientDefaultArgs<ExtArgs>>): Prisma__ClientClient<$Result.GetResult<Prisma.$ClientPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    referred<T extends ClientDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ClientDefaultArgs<ExtArgs>>): Prisma__ClientClient<$Result.GetResult<Prisma.$ClientPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Indication model
   */
  interface IndicationFieldRefs {
    readonly id: FieldRef<"Indication", 'String'>
    readonly referrerId: FieldRef<"Indication", 'String'>
    readonly referredId: FieldRef<"Indication", 'String'>
    readonly status: FieldRef<"Indication", 'IndicationStatus'>
    readonly createdAt: FieldRef<"Indication", 'DateTime'>
    readonly updatedAt: FieldRef<"Indication", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Indication findUnique
   */
  export type IndicationFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Indication
     */
    select?: IndicationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Indication
     */
    omit?: IndicationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IndicationInclude<ExtArgs> | null
    /**
     * Filter, which Indication to fetch.
     */
    where: IndicationWhereUniqueInput
  }

  /**
   * Indication findUniqueOrThrow
   */
  export type IndicationFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Indication
     */
    select?: IndicationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Indication
     */
    omit?: IndicationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IndicationInclude<ExtArgs> | null
    /**
     * Filter, which Indication to fetch.
     */
    where: IndicationWhereUniqueInput
  }

  /**
   * Indication findFirst
   */
  export type IndicationFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Indication
     */
    select?: IndicationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Indication
     */
    omit?: IndicationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IndicationInclude<ExtArgs> | null
    /**
     * Filter, which Indication to fetch.
     */
    where?: IndicationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Indications to fetch.
     */
    orderBy?: IndicationOrderByWithRelationInput | IndicationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Indications.
     */
    cursor?: IndicationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Indications from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Indications.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Indications.
     */
    distinct?: IndicationScalarFieldEnum | IndicationScalarFieldEnum[]
  }

  /**
   * Indication findFirstOrThrow
   */
  export type IndicationFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Indication
     */
    select?: IndicationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Indication
     */
    omit?: IndicationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IndicationInclude<ExtArgs> | null
    /**
     * Filter, which Indication to fetch.
     */
    where?: IndicationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Indications to fetch.
     */
    orderBy?: IndicationOrderByWithRelationInput | IndicationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Indications.
     */
    cursor?: IndicationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Indications from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Indications.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Indications.
     */
    distinct?: IndicationScalarFieldEnum | IndicationScalarFieldEnum[]
  }

  /**
   * Indication findMany
   */
  export type IndicationFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Indication
     */
    select?: IndicationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Indication
     */
    omit?: IndicationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IndicationInclude<ExtArgs> | null
    /**
     * Filter, which Indications to fetch.
     */
    where?: IndicationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Indications to fetch.
     */
    orderBy?: IndicationOrderByWithRelationInput | IndicationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Indications.
     */
    cursor?: IndicationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Indications from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Indications.
     */
    skip?: number
    distinct?: IndicationScalarFieldEnum | IndicationScalarFieldEnum[]
  }

  /**
   * Indication create
   */
  export type IndicationCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Indication
     */
    select?: IndicationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Indication
     */
    omit?: IndicationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IndicationInclude<ExtArgs> | null
    /**
     * The data needed to create a Indication.
     */
    data: XOR<IndicationCreateInput, IndicationUncheckedCreateInput>
  }

  /**
   * Indication createMany
   */
  export type IndicationCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Indications.
     */
    data: IndicationCreateManyInput | IndicationCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Indication createManyAndReturn
   */
  export type IndicationCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Indication
     */
    select?: IndicationSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Indication
     */
    omit?: IndicationOmit<ExtArgs> | null
    /**
     * The data used to create many Indications.
     */
    data: IndicationCreateManyInput | IndicationCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IndicationIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Indication update
   */
  export type IndicationUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Indication
     */
    select?: IndicationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Indication
     */
    omit?: IndicationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IndicationInclude<ExtArgs> | null
    /**
     * The data needed to update a Indication.
     */
    data: XOR<IndicationUpdateInput, IndicationUncheckedUpdateInput>
    /**
     * Choose, which Indication to update.
     */
    where: IndicationWhereUniqueInput
  }

  /**
   * Indication updateMany
   */
  export type IndicationUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Indications.
     */
    data: XOR<IndicationUpdateManyMutationInput, IndicationUncheckedUpdateManyInput>
    /**
     * Filter which Indications to update
     */
    where?: IndicationWhereInput
    /**
     * Limit how many Indications to update.
     */
    limit?: number
  }

  /**
   * Indication updateManyAndReturn
   */
  export type IndicationUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Indication
     */
    select?: IndicationSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Indication
     */
    omit?: IndicationOmit<ExtArgs> | null
    /**
     * The data used to update Indications.
     */
    data: XOR<IndicationUpdateManyMutationInput, IndicationUncheckedUpdateManyInput>
    /**
     * Filter which Indications to update
     */
    where?: IndicationWhereInput
    /**
     * Limit how many Indications to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IndicationIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Indication upsert
   */
  export type IndicationUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Indication
     */
    select?: IndicationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Indication
     */
    omit?: IndicationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IndicationInclude<ExtArgs> | null
    /**
     * The filter to search for the Indication to update in case it exists.
     */
    where: IndicationWhereUniqueInput
    /**
     * In case the Indication found by the `where` argument doesn't exist, create a new Indication with this data.
     */
    create: XOR<IndicationCreateInput, IndicationUncheckedCreateInput>
    /**
     * In case the Indication was found with the provided `where` argument, update it with this data.
     */
    update: XOR<IndicationUpdateInput, IndicationUncheckedUpdateInput>
  }

  /**
   * Indication delete
   */
  export type IndicationDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Indication
     */
    select?: IndicationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Indication
     */
    omit?: IndicationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IndicationInclude<ExtArgs> | null
    /**
     * Filter which Indication to delete.
     */
    where: IndicationWhereUniqueInput
  }

  /**
   * Indication deleteMany
   */
  export type IndicationDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Indications to delete
     */
    where?: IndicationWhereInput
    /**
     * Limit how many Indications to delete.
     */
    limit?: number
  }

  /**
   * Indication without action
   */
  export type IndicationDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Indication
     */
    select?: IndicationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Indication
     */
    omit?: IndicationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IndicationInclude<ExtArgs> | null
  }


  /**
   * Model Offer
   */

  export type AggregateOffer = {
    _count: OfferCountAggregateOutputType | null
    _avg: OfferAvgAggregateOutputType | null
    _sum: OfferSumAggregateOutputType | null
    _min: OfferMinAggregateOutputType | null
    _max: OfferMaxAggregateOutputType | null
  }

  export type OfferAvgAggregateOutputType = {
    cost: number | null
  }

  export type OfferSumAggregateOutputType = {
    cost: number | null
  }

  export type OfferMinAggregateOutputType = {
    id: string | null
    title: string | null
    description: string | null
    partner: string | null
    cost: number | null
    discount: string | null
    imageUrl: string | null
    validFrom: Date | null
    validTo: Date | null
    isActive: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type OfferMaxAggregateOutputType = {
    id: string | null
    title: string | null
    description: string | null
    partner: string | null
    cost: number | null
    discount: string | null
    imageUrl: string | null
    validFrom: Date | null
    validTo: Date | null
    isActive: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type OfferCountAggregateOutputType = {
    id: number
    title: number
    description: number
    partner: number
    cost: number
    discount: number
    imageUrl: number
    validFrom: number
    validTo: number
    isActive: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type OfferAvgAggregateInputType = {
    cost?: true
  }

  export type OfferSumAggregateInputType = {
    cost?: true
  }

  export type OfferMinAggregateInputType = {
    id?: true
    title?: true
    description?: true
    partner?: true
    cost?: true
    discount?: true
    imageUrl?: true
    validFrom?: true
    validTo?: true
    isActive?: true
    createdAt?: true
    updatedAt?: true
  }

  export type OfferMaxAggregateInputType = {
    id?: true
    title?: true
    description?: true
    partner?: true
    cost?: true
    discount?: true
    imageUrl?: true
    validFrom?: true
    validTo?: true
    isActive?: true
    createdAt?: true
    updatedAt?: true
  }

  export type OfferCountAggregateInputType = {
    id?: true
    title?: true
    description?: true
    partner?: true
    cost?: true
    discount?: true
    imageUrl?: true
    validFrom?: true
    validTo?: true
    isActive?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type OfferAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Offer to aggregate.
     */
    where?: OfferWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Offers to fetch.
     */
    orderBy?: OfferOrderByWithRelationInput | OfferOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: OfferWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Offers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Offers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Offers
    **/
    _count?: true | OfferCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: OfferAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: OfferSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: OfferMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: OfferMaxAggregateInputType
  }

  export type GetOfferAggregateType<T extends OfferAggregateArgs> = {
        [P in keyof T & keyof AggregateOffer]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateOffer[P]>
      : GetScalarType<T[P], AggregateOffer[P]>
  }




  export type OfferGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OfferWhereInput
    orderBy?: OfferOrderByWithAggregationInput | OfferOrderByWithAggregationInput[]
    by: OfferScalarFieldEnum[] | OfferScalarFieldEnum
    having?: OfferScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: OfferCountAggregateInputType | true
    _avg?: OfferAvgAggregateInputType
    _sum?: OfferSumAggregateInputType
    _min?: OfferMinAggregateInputType
    _max?: OfferMaxAggregateInputType
  }

  export type OfferGroupByOutputType = {
    id: string
    title: string
    description: string
    partner: string
    cost: number
    discount: string | null
    imageUrl: string | null
    validFrom: Date | null
    validTo: Date | null
    isActive: boolean
    createdAt: Date
    updatedAt: Date
    _count: OfferCountAggregateOutputType | null
    _avg: OfferAvgAggregateOutputType | null
    _sum: OfferSumAggregateOutputType | null
    _min: OfferMinAggregateOutputType | null
    _max: OfferMaxAggregateOutputType | null
  }

  type GetOfferGroupByPayload<T extends OfferGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<OfferGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof OfferGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], OfferGroupByOutputType[P]>
            : GetScalarType<T[P], OfferGroupByOutputType[P]>
        }
      >
    >


  export type OfferSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    title?: boolean
    description?: boolean
    partner?: boolean
    cost?: boolean
    discount?: boolean
    imageUrl?: boolean
    validFrom?: boolean
    validTo?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["offer"]>

  export type OfferSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    title?: boolean
    description?: boolean
    partner?: boolean
    cost?: boolean
    discount?: boolean
    imageUrl?: boolean
    validFrom?: boolean
    validTo?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["offer"]>

  export type OfferSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    title?: boolean
    description?: boolean
    partner?: boolean
    cost?: boolean
    discount?: boolean
    imageUrl?: boolean
    validFrom?: boolean
    validTo?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["offer"]>

  export type OfferSelectScalar = {
    id?: boolean
    title?: boolean
    description?: boolean
    partner?: boolean
    cost?: boolean
    discount?: boolean
    imageUrl?: boolean
    validFrom?: boolean
    validTo?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type OfferOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "title" | "description" | "partner" | "cost" | "discount" | "imageUrl" | "validFrom" | "validTo" | "isActive" | "createdAt" | "updatedAt", ExtArgs["result"]["offer"]>

  export type $OfferPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Offer"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      title: string
      description: string
      partner: string
      cost: number
      discount: string | null
      imageUrl: string | null
      validFrom: Date | null
      validTo: Date | null
      isActive: boolean
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["offer"]>
    composites: {}
  }

  type OfferGetPayload<S extends boolean | null | undefined | OfferDefaultArgs> = $Result.GetResult<Prisma.$OfferPayload, S>

  type OfferCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<OfferFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: OfferCountAggregateInputType | true
    }

  export interface OfferDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Offer'], meta: { name: 'Offer' } }
    /**
     * Find zero or one Offer that matches the filter.
     * @param {OfferFindUniqueArgs} args - Arguments to find a Offer
     * @example
     * // Get one Offer
     * const offer = await prisma.offer.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends OfferFindUniqueArgs>(args: SelectSubset<T, OfferFindUniqueArgs<ExtArgs>>): Prisma__OfferClient<$Result.GetResult<Prisma.$OfferPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Offer that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {OfferFindUniqueOrThrowArgs} args - Arguments to find a Offer
     * @example
     * // Get one Offer
     * const offer = await prisma.offer.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends OfferFindUniqueOrThrowArgs>(args: SelectSubset<T, OfferFindUniqueOrThrowArgs<ExtArgs>>): Prisma__OfferClient<$Result.GetResult<Prisma.$OfferPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Offer that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OfferFindFirstArgs} args - Arguments to find a Offer
     * @example
     * // Get one Offer
     * const offer = await prisma.offer.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends OfferFindFirstArgs>(args?: SelectSubset<T, OfferFindFirstArgs<ExtArgs>>): Prisma__OfferClient<$Result.GetResult<Prisma.$OfferPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Offer that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OfferFindFirstOrThrowArgs} args - Arguments to find a Offer
     * @example
     * // Get one Offer
     * const offer = await prisma.offer.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends OfferFindFirstOrThrowArgs>(args?: SelectSubset<T, OfferFindFirstOrThrowArgs<ExtArgs>>): Prisma__OfferClient<$Result.GetResult<Prisma.$OfferPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Offers that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OfferFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Offers
     * const offers = await prisma.offer.findMany()
     * 
     * // Get first 10 Offers
     * const offers = await prisma.offer.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const offerWithIdOnly = await prisma.offer.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends OfferFindManyArgs>(args?: SelectSubset<T, OfferFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OfferPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Offer.
     * @param {OfferCreateArgs} args - Arguments to create a Offer.
     * @example
     * // Create one Offer
     * const Offer = await prisma.offer.create({
     *   data: {
     *     // ... data to create a Offer
     *   }
     * })
     * 
     */
    create<T extends OfferCreateArgs>(args: SelectSubset<T, OfferCreateArgs<ExtArgs>>): Prisma__OfferClient<$Result.GetResult<Prisma.$OfferPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Offers.
     * @param {OfferCreateManyArgs} args - Arguments to create many Offers.
     * @example
     * // Create many Offers
     * const offer = await prisma.offer.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends OfferCreateManyArgs>(args?: SelectSubset<T, OfferCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Offers and returns the data saved in the database.
     * @param {OfferCreateManyAndReturnArgs} args - Arguments to create many Offers.
     * @example
     * // Create many Offers
     * const offer = await prisma.offer.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Offers and only return the `id`
     * const offerWithIdOnly = await prisma.offer.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends OfferCreateManyAndReturnArgs>(args?: SelectSubset<T, OfferCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OfferPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Offer.
     * @param {OfferDeleteArgs} args - Arguments to delete one Offer.
     * @example
     * // Delete one Offer
     * const Offer = await prisma.offer.delete({
     *   where: {
     *     // ... filter to delete one Offer
     *   }
     * })
     * 
     */
    delete<T extends OfferDeleteArgs>(args: SelectSubset<T, OfferDeleteArgs<ExtArgs>>): Prisma__OfferClient<$Result.GetResult<Prisma.$OfferPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Offer.
     * @param {OfferUpdateArgs} args - Arguments to update one Offer.
     * @example
     * // Update one Offer
     * const offer = await prisma.offer.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends OfferUpdateArgs>(args: SelectSubset<T, OfferUpdateArgs<ExtArgs>>): Prisma__OfferClient<$Result.GetResult<Prisma.$OfferPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Offers.
     * @param {OfferDeleteManyArgs} args - Arguments to filter Offers to delete.
     * @example
     * // Delete a few Offers
     * const { count } = await prisma.offer.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends OfferDeleteManyArgs>(args?: SelectSubset<T, OfferDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Offers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OfferUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Offers
     * const offer = await prisma.offer.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends OfferUpdateManyArgs>(args: SelectSubset<T, OfferUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Offers and returns the data updated in the database.
     * @param {OfferUpdateManyAndReturnArgs} args - Arguments to update many Offers.
     * @example
     * // Update many Offers
     * const offer = await prisma.offer.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Offers and only return the `id`
     * const offerWithIdOnly = await prisma.offer.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends OfferUpdateManyAndReturnArgs>(args: SelectSubset<T, OfferUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OfferPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Offer.
     * @param {OfferUpsertArgs} args - Arguments to update or create a Offer.
     * @example
     * // Update or create a Offer
     * const offer = await prisma.offer.upsert({
     *   create: {
     *     // ... data to create a Offer
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Offer we want to update
     *   }
     * })
     */
    upsert<T extends OfferUpsertArgs>(args: SelectSubset<T, OfferUpsertArgs<ExtArgs>>): Prisma__OfferClient<$Result.GetResult<Prisma.$OfferPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Offers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OfferCountArgs} args - Arguments to filter Offers to count.
     * @example
     * // Count the number of Offers
     * const count = await prisma.offer.count({
     *   where: {
     *     // ... the filter for the Offers we want to count
     *   }
     * })
    **/
    count<T extends OfferCountArgs>(
      args?: Subset<T, OfferCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], OfferCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Offer.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OfferAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends OfferAggregateArgs>(args: Subset<T, OfferAggregateArgs>): Prisma.PrismaPromise<GetOfferAggregateType<T>>

    /**
     * Group by Offer.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OfferGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends OfferGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: OfferGroupByArgs['orderBy'] }
        : { orderBy?: OfferGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, OfferGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetOfferGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Offer model
   */
  readonly fields: OfferFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Offer.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__OfferClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Offer model
   */
  interface OfferFieldRefs {
    readonly id: FieldRef<"Offer", 'String'>
    readonly title: FieldRef<"Offer", 'String'>
    readonly description: FieldRef<"Offer", 'String'>
    readonly partner: FieldRef<"Offer", 'String'>
    readonly cost: FieldRef<"Offer", 'Float'>
    readonly discount: FieldRef<"Offer", 'String'>
    readonly imageUrl: FieldRef<"Offer", 'String'>
    readonly validFrom: FieldRef<"Offer", 'DateTime'>
    readonly validTo: FieldRef<"Offer", 'DateTime'>
    readonly isActive: FieldRef<"Offer", 'Boolean'>
    readonly createdAt: FieldRef<"Offer", 'DateTime'>
    readonly updatedAt: FieldRef<"Offer", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Offer findUnique
   */
  export type OfferFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Offer
     */
    select?: OfferSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Offer
     */
    omit?: OfferOmit<ExtArgs> | null
    /**
     * Filter, which Offer to fetch.
     */
    where: OfferWhereUniqueInput
  }

  /**
   * Offer findUniqueOrThrow
   */
  export type OfferFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Offer
     */
    select?: OfferSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Offer
     */
    omit?: OfferOmit<ExtArgs> | null
    /**
     * Filter, which Offer to fetch.
     */
    where: OfferWhereUniqueInput
  }

  /**
   * Offer findFirst
   */
  export type OfferFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Offer
     */
    select?: OfferSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Offer
     */
    omit?: OfferOmit<ExtArgs> | null
    /**
     * Filter, which Offer to fetch.
     */
    where?: OfferWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Offers to fetch.
     */
    orderBy?: OfferOrderByWithRelationInput | OfferOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Offers.
     */
    cursor?: OfferWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Offers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Offers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Offers.
     */
    distinct?: OfferScalarFieldEnum | OfferScalarFieldEnum[]
  }

  /**
   * Offer findFirstOrThrow
   */
  export type OfferFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Offer
     */
    select?: OfferSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Offer
     */
    omit?: OfferOmit<ExtArgs> | null
    /**
     * Filter, which Offer to fetch.
     */
    where?: OfferWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Offers to fetch.
     */
    orderBy?: OfferOrderByWithRelationInput | OfferOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Offers.
     */
    cursor?: OfferWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Offers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Offers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Offers.
     */
    distinct?: OfferScalarFieldEnum | OfferScalarFieldEnum[]
  }

  /**
   * Offer findMany
   */
  export type OfferFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Offer
     */
    select?: OfferSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Offer
     */
    omit?: OfferOmit<ExtArgs> | null
    /**
     * Filter, which Offers to fetch.
     */
    where?: OfferWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Offers to fetch.
     */
    orderBy?: OfferOrderByWithRelationInput | OfferOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Offers.
     */
    cursor?: OfferWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Offers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Offers.
     */
    skip?: number
    distinct?: OfferScalarFieldEnum | OfferScalarFieldEnum[]
  }

  /**
   * Offer create
   */
  export type OfferCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Offer
     */
    select?: OfferSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Offer
     */
    omit?: OfferOmit<ExtArgs> | null
    /**
     * The data needed to create a Offer.
     */
    data: XOR<OfferCreateInput, OfferUncheckedCreateInput>
  }

  /**
   * Offer createMany
   */
  export type OfferCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Offers.
     */
    data: OfferCreateManyInput | OfferCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Offer createManyAndReturn
   */
  export type OfferCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Offer
     */
    select?: OfferSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Offer
     */
    omit?: OfferOmit<ExtArgs> | null
    /**
     * The data used to create many Offers.
     */
    data: OfferCreateManyInput | OfferCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Offer update
   */
  export type OfferUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Offer
     */
    select?: OfferSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Offer
     */
    omit?: OfferOmit<ExtArgs> | null
    /**
     * The data needed to update a Offer.
     */
    data: XOR<OfferUpdateInput, OfferUncheckedUpdateInput>
    /**
     * Choose, which Offer to update.
     */
    where: OfferWhereUniqueInput
  }

  /**
   * Offer updateMany
   */
  export type OfferUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Offers.
     */
    data: XOR<OfferUpdateManyMutationInput, OfferUncheckedUpdateManyInput>
    /**
     * Filter which Offers to update
     */
    where?: OfferWhereInput
    /**
     * Limit how many Offers to update.
     */
    limit?: number
  }

  /**
   * Offer updateManyAndReturn
   */
  export type OfferUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Offer
     */
    select?: OfferSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Offer
     */
    omit?: OfferOmit<ExtArgs> | null
    /**
     * The data used to update Offers.
     */
    data: XOR<OfferUpdateManyMutationInput, OfferUncheckedUpdateManyInput>
    /**
     * Filter which Offers to update
     */
    where?: OfferWhereInput
    /**
     * Limit how many Offers to update.
     */
    limit?: number
  }

  /**
   * Offer upsert
   */
  export type OfferUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Offer
     */
    select?: OfferSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Offer
     */
    omit?: OfferOmit<ExtArgs> | null
    /**
     * The filter to search for the Offer to update in case it exists.
     */
    where: OfferWhereUniqueInput
    /**
     * In case the Offer found by the `where` argument doesn't exist, create a new Offer with this data.
     */
    create: XOR<OfferCreateInput, OfferUncheckedCreateInput>
    /**
     * In case the Offer was found with the provided `where` argument, update it with this data.
     */
    update: XOR<OfferUpdateInput, OfferUncheckedUpdateInput>
  }

  /**
   * Offer delete
   */
  export type OfferDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Offer
     */
    select?: OfferSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Offer
     */
    omit?: OfferOmit<ExtArgs> | null
    /**
     * Filter which Offer to delete.
     */
    where: OfferWhereUniqueInput
  }

  /**
   * Offer deleteMany
   */
  export type OfferDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Offers to delete
     */
    where?: OfferWhereInput
    /**
     * Limit how many Offers to delete.
     */
    limit?: number
  }

  /**
   * Offer without action
   */
  export type OfferDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Offer
     */
    select?: OfferSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Offer
     */
    omit?: OfferOmit<ExtArgs> | null
  }


  /**
   * Model FAQ
   */

  export type AggregateFAQ = {
    _count: FAQCountAggregateOutputType | null
    _min: FAQMinAggregateOutputType | null
    _max: FAQMaxAggregateOutputType | null
  }

  export type FAQMinAggregateOutputType = {
    id: string | null
    question: string | null
    answer: string | null
    category: string | null
    isActive: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type FAQMaxAggregateOutputType = {
    id: string | null
    question: string | null
    answer: string | null
    category: string | null
    isActive: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type FAQCountAggregateOutputType = {
    id: number
    question: number
    answer: number
    category: number
    isActive: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type FAQMinAggregateInputType = {
    id?: true
    question?: true
    answer?: true
    category?: true
    isActive?: true
    createdAt?: true
    updatedAt?: true
  }

  export type FAQMaxAggregateInputType = {
    id?: true
    question?: true
    answer?: true
    category?: true
    isActive?: true
    createdAt?: true
    updatedAt?: true
  }

  export type FAQCountAggregateInputType = {
    id?: true
    question?: true
    answer?: true
    category?: true
    isActive?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type FAQAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which FAQ to aggregate.
     */
    where?: FAQWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of FAQS to fetch.
     */
    orderBy?: FAQOrderByWithRelationInput | FAQOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: FAQWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` FAQS from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` FAQS.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned FAQS
    **/
    _count?: true | FAQCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: FAQMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: FAQMaxAggregateInputType
  }

  export type GetFAQAggregateType<T extends FAQAggregateArgs> = {
        [P in keyof T & keyof AggregateFAQ]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateFAQ[P]>
      : GetScalarType<T[P], AggregateFAQ[P]>
  }




  export type FAQGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: FAQWhereInput
    orderBy?: FAQOrderByWithAggregationInput | FAQOrderByWithAggregationInput[]
    by: FAQScalarFieldEnum[] | FAQScalarFieldEnum
    having?: FAQScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: FAQCountAggregateInputType | true
    _min?: FAQMinAggregateInputType
    _max?: FAQMaxAggregateInputType
  }

  export type FAQGroupByOutputType = {
    id: string
    question: string
    answer: string
    category: string | null
    isActive: boolean
    createdAt: Date
    updatedAt: Date
    _count: FAQCountAggregateOutputType | null
    _min: FAQMinAggregateOutputType | null
    _max: FAQMaxAggregateOutputType | null
  }

  type GetFAQGroupByPayload<T extends FAQGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<FAQGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof FAQGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], FAQGroupByOutputType[P]>
            : GetScalarType<T[P], FAQGroupByOutputType[P]>
        }
      >
    >


  export type FAQSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    question?: boolean
    answer?: boolean
    category?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["fAQ"]>

  export type FAQSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    question?: boolean
    answer?: boolean
    category?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["fAQ"]>

  export type FAQSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    question?: boolean
    answer?: boolean
    category?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["fAQ"]>

  export type FAQSelectScalar = {
    id?: boolean
    question?: boolean
    answer?: boolean
    category?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type FAQOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "question" | "answer" | "category" | "isActive" | "createdAt" | "updatedAt", ExtArgs["result"]["fAQ"]>

  export type $FAQPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "FAQ"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      question: string
      answer: string
      category: string | null
      isActive: boolean
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["fAQ"]>
    composites: {}
  }

  type FAQGetPayload<S extends boolean | null | undefined | FAQDefaultArgs> = $Result.GetResult<Prisma.$FAQPayload, S>

  type FAQCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<FAQFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: FAQCountAggregateInputType | true
    }

  export interface FAQDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['FAQ'], meta: { name: 'FAQ' } }
    /**
     * Find zero or one FAQ that matches the filter.
     * @param {FAQFindUniqueArgs} args - Arguments to find a FAQ
     * @example
     * // Get one FAQ
     * const fAQ = await prisma.fAQ.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends FAQFindUniqueArgs>(args: SelectSubset<T, FAQFindUniqueArgs<ExtArgs>>): Prisma__FAQClient<$Result.GetResult<Prisma.$FAQPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one FAQ that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {FAQFindUniqueOrThrowArgs} args - Arguments to find a FAQ
     * @example
     * // Get one FAQ
     * const fAQ = await prisma.fAQ.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends FAQFindUniqueOrThrowArgs>(args: SelectSubset<T, FAQFindUniqueOrThrowArgs<ExtArgs>>): Prisma__FAQClient<$Result.GetResult<Prisma.$FAQPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first FAQ that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FAQFindFirstArgs} args - Arguments to find a FAQ
     * @example
     * // Get one FAQ
     * const fAQ = await prisma.fAQ.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends FAQFindFirstArgs>(args?: SelectSubset<T, FAQFindFirstArgs<ExtArgs>>): Prisma__FAQClient<$Result.GetResult<Prisma.$FAQPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first FAQ that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FAQFindFirstOrThrowArgs} args - Arguments to find a FAQ
     * @example
     * // Get one FAQ
     * const fAQ = await prisma.fAQ.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends FAQFindFirstOrThrowArgs>(args?: SelectSubset<T, FAQFindFirstOrThrowArgs<ExtArgs>>): Prisma__FAQClient<$Result.GetResult<Prisma.$FAQPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more FAQS that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FAQFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all FAQS
     * const fAQS = await prisma.fAQ.findMany()
     * 
     * // Get first 10 FAQS
     * const fAQS = await prisma.fAQ.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const fAQWithIdOnly = await prisma.fAQ.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends FAQFindManyArgs>(args?: SelectSubset<T, FAQFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FAQPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a FAQ.
     * @param {FAQCreateArgs} args - Arguments to create a FAQ.
     * @example
     * // Create one FAQ
     * const FAQ = await prisma.fAQ.create({
     *   data: {
     *     // ... data to create a FAQ
     *   }
     * })
     * 
     */
    create<T extends FAQCreateArgs>(args: SelectSubset<T, FAQCreateArgs<ExtArgs>>): Prisma__FAQClient<$Result.GetResult<Prisma.$FAQPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many FAQS.
     * @param {FAQCreateManyArgs} args - Arguments to create many FAQS.
     * @example
     * // Create many FAQS
     * const fAQ = await prisma.fAQ.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends FAQCreateManyArgs>(args?: SelectSubset<T, FAQCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many FAQS and returns the data saved in the database.
     * @param {FAQCreateManyAndReturnArgs} args - Arguments to create many FAQS.
     * @example
     * // Create many FAQS
     * const fAQ = await prisma.fAQ.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many FAQS and only return the `id`
     * const fAQWithIdOnly = await prisma.fAQ.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends FAQCreateManyAndReturnArgs>(args?: SelectSubset<T, FAQCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FAQPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a FAQ.
     * @param {FAQDeleteArgs} args - Arguments to delete one FAQ.
     * @example
     * // Delete one FAQ
     * const FAQ = await prisma.fAQ.delete({
     *   where: {
     *     // ... filter to delete one FAQ
     *   }
     * })
     * 
     */
    delete<T extends FAQDeleteArgs>(args: SelectSubset<T, FAQDeleteArgs<ExtArgs>>): Prisma__FAQClient<$Result.GetResult<Prisma.$FAQPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one FAQ.
     * @param {FAQUpdateArgs} args - Arguments to update one FAQ.
     * @example
     * // Update one FAQ
     * const fAQ = await prisma.fAQ.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends FAQUpdateArgs>(args: SelectSubset<T, FAQUpdateArgs<ExtArgs>>): Prisma__FAQClient<$Result.GetResult<Prisma.$FAQPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more FAQS.
     * @param {FAQDeleteManyArgs} args - Arguments to filter FAQS to delete.
     * @example
     * // Delete a few FAQS
     * const { count } = await prisma.fAQ.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends FAQDeleteManyArgs>(args?: SelectSubset<T, FAQDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more FAQS.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FAQUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many FAQS
     * const fAQ = await prisma.fAQ.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends FAQUpdateManyArgs>(args: SelectSubset<T, FAQUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more FAQS and returns the data updated in the database.
     * @param {FAQUpdateManyAndReturnArgs} args - Arguments to update many FAQS.
     * @example
     * // Update many FAQS
     * const fAQ = await prisma.fAQ.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more FAQS and only return the `id`
     * const fAQWithIdOnly = await prisma.fAQ.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends FAQUpdateManyAndReturnArgs>(args: SelectSubset<T, FAQUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FAQPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one FAQ.
     * @param {FAQUpsertArgs} args - Arguments to update or create a FAQ.
     * @example
     * // Update or create a FAQ
     * const fAQ = await prisma.fAQ.upsert({
     *   create: {
     *     // ... data to create a FAQ
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the FAQ we want to update
     *   }
     * })
     */
    upsert<T extends FAQUpsertArgs>(args: SelectSubset<T, FAQUpsertArgs<ExtArgs>>): Prisma__FAQClient<$Result.GetResult<Prisma.$FAQPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of FAQS.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FAQCountArgs} args - Arguments to filter FAQS to count.
     * @example
     * // Count the number of FAQS
     * const count = await prisma.fAQ.count({
     *   where: {
     *     // ... the filter for the FAQS we want to count
     *   }
     * })
    **/
    count<T extends FAQCountArgs>(
      args?: Subset<T, FAQCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], FAQCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a FAQ.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FAQAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends FAQAggregateArgs>(args: Subset<T, FAQAggregateArgs>): Prisma.PrismaPromise<GetFAQAggregateType<T>>

    /**
     * Group by FAQ.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FAQGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends FAQGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: FAQGroupByArgs['orderBy'] }
        : { orderBy?: FAQGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, FAQGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetFAQGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the FAQ model
   */
  readonly fields: FAQFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for FAQ.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__FAQClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the FAQ model
   */
  interface FAQFieldRefs {
    readonly id: FieldRef<"FAQ", 'String'>
    readonly question: FieldRef<"FAQ", 'String'>
    readonly answer: FieldRef<"FAQ", 'String'>
    readonly category: FieldRef<"FAQ", 'String'>
    readonly isActive: FieldRef<"FAQ", 'Boolean'>
    readonly createdAt: FieldRef<"FAQ", 'DateTime'>
    readonly updatedAt: FieldRef<"FAQ", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * FAQ findUnique
   */
  export type FAQFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FAQ
     */
    select?: FAQSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FAQ
     */
    omit?: FAQOmit<ExtArgs> | null
    /**
     * Filter, which FAQ to fetch.
     */
    where: FAQWhereUniqueInput
  }

  /**
   * FAQ findUniqueOrThrow
   */
  export type FAQFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FAQ
     */
    select?: FAQSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FAQ
     */
    omit?: FAQOmit<ExtArgs> | null
    /**
     * Filter, which FAQ to fetch.
     */
    where: FAQWhereUniqueInput
  }

  /**
   * FAQ findFirst
   */
  export type FAQFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FAQ
     */
    select?: FAQSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FAQ
     */
    omit?: FAQOmit<ExtArgs> | null
    /**
     * Filter, which FAQ to fetch.
     */
    where?: FAQWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of FAQS to fetch.
     */
    orderBy?: FAQOrderByWithRelationInput | FAQOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for FAQS.
     */
    cursor?: FAQWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` FAQS from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` FAQS.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of FAQS.
     */
    distinct?: FAQScalarFieldEnum | FAQScalarFieldEnum[]
  }

  /**
   * FAQ findFirstOrThrow
   */
  export type FAQFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FAQ
     */
    select?: FAQSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FAQ
     */
    omit?: FAQOmit<ExtArgs> | null
    /**
     * Filter, which FAQ to fetch.
     */
    where?: FAQWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of FAQS to fetch.
     */
    orderBy?: FAQOrderByWithRelationInput | FAQOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for FAQS.
     */
    cursor?: FAQWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` FAQS from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` FAQS.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of FAQS.
     */
    distinct?: FAQScalarFieldEnum | FAQScalarFieldEnum[]
  }

  /**
   * FAQ findMany
   */
  export type FAQFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FAQ
     */
    select?: FAQSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FAQ
     */
    omit?: FAQOmit<ExtArgs> | null
    /**
     * Filter, which FAQS to fetch.
     */
    where?: FAQWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of FAQS to fetch.
     */
    orderBy?: FAQOrderByWithRelationInput | FAQOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing FAQS.
     */
    cursor?: FAQWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` FAQS from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` FAQS.
     */
    skip?: number
    distinct?: FAQScalarFieldEnum | FAQScalarFieldEnum[]
  }

  /**
   * FAQ create
   */
  export type FAQCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FAQ
     */
    select?: FAQSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FAQ
     */
    omit?: FAQOmit<ExtArgs> | null
    /**
     * The data needed to create a FAQ.
     */
    data: XOR<FAQCreateInput, FAQUncheckedCreateInput>
  }

  /**
   * FAQ createMany
   */
  export type FAQCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many FAQS.
     */
    data: FAQCreateManyInput | FAQCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * FAQ createManyAndReturn
   */
  export type FAQCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FAQ
     */
    select?: FAQSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the FAQ
     */
    omit?: FAQOmit<ExtArgs> | null
    /**
     * The data used to create many FAQS.
     */
    data: FAQCreateManyInput | FAQCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * FAQ update
   */
  export type FAQUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FAQ
     */
    select?: FAQSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FAQ
     */
    omit?: FAQOmit<ExtArgs> | null
    /**
     * The data needed to update a FAQ.
     */
    data: XOR<FAQUpdateInput, FAQUncheckedUpdateInput>
    /**
     * Choose, which FAQ to update.
     */
    where: FAQWhereUniqueInput
  }

  /**
   * FAQ updateMany
   */
  export type FAQUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update FAQS.
     */
    data: XOR<FAQUpdateManyMutationInput, FAQUncheckedUpdateManyInput>
    /**
     * Filter which FAQS to update
     */
    where?: FAQWhereInput
    /**
     * Limit how many FAQS to update.
     */
    limit?: number
  }

  /**
   * FAQ updateManyAndReturn
   */
  export type FAQUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FAQ
     */
    select?: FAQSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the FAQ
     */
    omit?: FAQOmit<ExtArgs> | null
    /**
     * The data used to update FAQS.
     */
    data: XOR<FAQUpdateManyMutationInput, FAQUncheckedUpdateManyInput>
    /**
     * Filter which FAQS to update
     */
    where?: FAQWhereInput
    /**
     * Limit how many FAQS to update.
     */
    limit?: number
  }

  /**
   * FAQ upsert
   */
  export type FAQUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FAQ
     */
    select?: FAQSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FAQ
     */
    omit?: FAQOmit<ExtArgs> | null
    /**
     * The filter to search for the FAQ to update in case it exists.
     */
    where: FAQWhereUniqueInput
    /**
     * In case the FAQ found by the `where` argument doesn't exist, create a new FAQ with this data.
     */
    create: XOR<FAQCreateInput, FAQUncheckedCreateInput>
    /**
     * In case the FAQ was found with the provided `where` argument, update it with this data.
     */
    update: XOR<FAQUpdateInput, FAQUncheckedUpdateInput>
  }

  /**
   * FAQ delete
   */
  export type FAQDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FAQ
     */
    select?: FAQSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FAQ
     */
    omit?: FAQOmit<ExtArgs> | null
    /**
     * Filter which FAQ to delete.
     */
    where: FAQWhereUniqueInput
  }

  /**
   * FAQ deleteMany
   */
  export type FAQDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which FAQS to delete
     */
    where?: FAQWhereInput
    /**
     * Limit how many FAQS to delete.
     */
    limit?: number
  }

  /**
   * FAQ without action
   */
  export type FAQDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FAQ
     */
    select?: FAQSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FAQ
     */
    omit?: FAQOmit<ExtArgs> | null
  }


  /**
   * Model Transaction
   */

  export type AggregateTransaction = {
    _count: TransactionCountAggregateOutputType | null
    _avg: TransactionAvgAggregateOutputType | null
    _sum: TransactionSumAggregateOutputType | null
    _min: TransactionMinAggregateOutputType | null
    _max: TransactionMaxAggregateOutputType | null
  }

  export type TransactionAvgAggregateOutputType = {
    amount: number | null
  }

  export type TransactionSumAggregateOutputType = {
    amount: number | null
  }

  export type TransactionMinAggregateOutputType = {
    id: string | null
    clientId: string | null
    type: $Enums.TransactionType | null
    amount: number | null
    description: string | null
    offerId: string | null
    indicationId: string | null
    createdAt: Date | null
  }

  export type TransactionMaxAggregateOutputType = {
    id: string | null
    clientId: string | null
    type: $Enums.TransactionType | null
    amount: number | null
    description: string | null
    offerId: string | null
    indicationId: string | null
    createdAt: Date | null
  }

  export type TransactionCountAggregateOutputType = {
    id: number
    clientId: number
    type: number
    amount: number
    description: number
    offerId: number
    indicationId: number
    createdAt: number
    _all: number
  }


  export type TransactionAvgAggregateInputType = {
    amount?: true
  }

  export type TransactionSumAggregateInputType = {
    amount?: true
  }

  export type TransactionMinAggregateInputType = {
    id?: true
    clientId?: true
    type?: true
    amount?: true
    description?: true
    offerId?: true
    indicationId?: true
    createdAt?: true
  }

  export type TransactionMaxAggregateInputType = {
    id?: true
    clientId?: true
    type?: true
    amount?: true
    description?: true
    offerId?: true
    indicationId?: true
    createdAt?: true
  }

  export type TransactionCountAggregateInputType = {
    id?: true
    clientId?: true
    type?: true
    amount?: true
    description?: true
    offerId?: true
    indicationId?: true
    createdAt?: true
    _all?: true
  }

  export type TransactionAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Transaction to aggregate.
     */
    where?: TransactionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Transactions to fetch.
     */
    orderBy?: TransactionOrderByWithRelationInput | TransactionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: TransactionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Transactions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Transactions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Transactions
    **/
    _count?: true | TransactionCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: TransactionAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: TransactionSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: TransactionMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: TransactionMaxAggregateInputType
  }

  export type GetTransactionAggregateType<T extends TransactionAggregateArgs> = {
        [P in keyof T & keyof AggregateTransaction]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTransaction[P]>
      : GetScalarType<T[P], AggregateTransaction[P]>
  }




  export type TransactionGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TransactionWhereInput
    orderBy?: TransactionOrderByWithAggregationInput | TransactionOrderByWithAggregationInput[]
    by: TransactionScalarFieldEnum[] | TransactionScalarFieldEnum
    having?: TransactionScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: TransactionCountAggregateInputType | true
    _avg?: TransactionAvgAggregateInputType
    _sum?: TransactionSumAggregateInputType
    _min?: TransactionMinAggregateInputType
    _max?: TransactionMaxAggregateInputType
  }

  export type TransactionGroupByOutputType = {
    id: string
    clientId: string
    type: $Enums.TransactionType
    amount: number
    description: string | null
    offerId: string | null
    indicationId: string | null
    createdAt: Date
    _count: TransactionCountAggregateOutputType | null
    _avg: TransactionAvgAggregateOutputType | null
    _sum: TransactionSumAggregateOutputType | null
    _min: TransactionMinAggregateOutputType | null
    _max: TransactionMaxAggregateOutputType | null
  }

  type GetTransactionGroupByPayload<T extends TransactionGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<TransactionGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof TransactionGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], TransactionGroupByOutputType[P]>
            : GetScalarType<T[P], TransactionGroupByOutputType[P]>
        }
      >
    >


  export type TransactionSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    clientId?: boolean
    type?: boolean
    amount?: boolean
    description?: boolean
    offerId?: boolean
    indicationId?: boolean
    createdAt?: boolean
    client?: boolean | ClientDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["transaction"]>

  export type TransactionSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    clientId?: boolean
    type?: boolean
    amount?: boolean
    description?: boolean
    offerId?: boolean
    indicationId?: boolean
    createdAt?: boolean
    client?: boolean | ClientDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["transaction"]>

  export type TransactionSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    clientId?: boolean
    type?: boolean
    amount?: boolean
    description?: boolean
    offerId?: boolean
    indicationId?: boolean
    createdAt?: boolean
    client?: boolean | ClientDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["transaction"]>

  export type TransactionSelectScalar = {
    id?: boolean
    clientId?: boolean
    type?: boolean
    amount?: boolean
    description?: boolean
    offerId?: boolean
    indicationId?: boolean
    createdAt?: boolean
  }

  export type TransactionOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "clientId" | "type" | "amount" | "description" | "offerId" | "indicationId" | "createdAt", ExtArgs["result"]["transaction"]>
  export type TransactionInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    client?: boolean | ClientDefaultArgs<ExtArgs>
  }
  export type TransactionIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    client?: boolean | ClientDefaultArgs<ExtArgs>
  }
  export type TransactionIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    client?: boolean | ClientDefaultArgs<ExtArgs>
  }

  export type $TransactionPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Transaction"
    objects: {
      client: Prisma.$ClientPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      clientId: string
      type: $Enums.TransactionType
      amount: number
      description: string | null
      offerId: string | null
      indicationId: string | null
      createdAt: Date
    }, ExtArgs["result"]["transaction"]>
    composites: {}
  }

  type TransactionGetPayload<S extends boolean | null | undefined | TransactionDefaultArgs> = $Result.GetResult<Prisma.$TransactionPayload, S>

  type TransactionCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<TransactionFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: TransactionCountAggregateInputType | true
    }

  export interface TransactionDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Transaction'], meta: { name: 'Transaction' } }
    /**
     * Find zero or one Transaction that matches the filter.
     * @param {TransactionFindUniqueArgs} args - Arguments to find a Transaction
     * @example
     * // Get one Transaction
     * const transaction = await prisma.transaction.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends TransactionFindUniqueArgs>(args: SelectSubset<T, TransactionFindUniqueArgs<ExtArgs>>): Prisma__TransactionClient<$Result.GetResult<Prisma.$TransactionPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Transaction that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {TransactionFindUniqueOrThrowArgs} args - Arguments to find a Transaction
     * @example
     * // Get one Transaction
     * const transaction = await prisma.transaction.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends TransactionFindUniqueOrThrowArgs>(args: SelectSubset<T, TransactionFindUniqueOrThrowArgs<ExtArgs>>): Prisma__TransactionClient<$Result.GetResult<Prisma.$TransactionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Transaction that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TransactionFindFirstArgs} args - Arguments to find a Transaction
     * @example
     * // Get one Transaction
     * const transaction = await prisma.transaction.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends TransactionFindFirstArgs>(args?: SelectSubset<T, TransactionFindFirstArgs<ExtArgs>>): Prisma__TransactionClient<$Result.GetResult<Prisma.$TransactionPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Transaction that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TransactionFindFirstOrThrowArgs} args - Arguments to find a Transaction
     * @example
     * // Get one Transaction
     * const transaction = await prisma.transaction.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends TransactionFindFirstOrThrowArgs>(args?: SelectSubset<T, TransactionFindFirstOrThrowArgs<ExtArgs>>): Prisma__TransactionClient<$Result.GetResult<Prisma.$TransactionPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Transactions that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TransactionFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Transactions
     * const transactions = await prisma.transaction.findMany()
     * 
     * // Get first 10 Transactions
     * const transactions = await prisma.transaction.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const transactionWithIdOnly = await prisma.transaction.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends TransactionFindManyArgs>(args?: SelectSubset<T, TransactionFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TransactionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Transaction.
     * @param {TransactionCreateArgs} args - Arguments to create a Transaction.
     * @example
     * // Create one Transaction
     * const Transaction = await prisma.transaction.create({
     *   data: {
     *     // ... data to create a Transaction
     *   }
     * })
     * 
     */
    create<T extends TransactionCreateArgs>(args: SelectSubset<T, TransactionCreateArgs<ExtArgs>>): Prisma__TransactionClient<$Result.GetResult<Prisma.$TransactionPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Transactions.
     * @param {TransactionCreateManyArgs} args - Arguments to create many Transactions.
     * @example
     * // Create many Transactions
     * const transaction = await prisma.transaction.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends TransactionCreateManyArgs>(args?: SelectSubset<T, TransactionCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Transactions and returns the data saved in the database.
     * @param {TransactionCreateManyAndReturnArgs} args - Arguments to create many Transactions.
     * @example
     * // Create many Transactions
     * const transaction = await prisma.transaction.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Transactions and only return the `id`
     * const transactionWithIdOnly = await prisma.transaction.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends TransactionCreateManyAndReturnArgs>(args?: SelectSubset<T, TransactionCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TransactionPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Transaction.
     * @param {TransactionDeleteArgs} args - Arguments to delete one Transaction.
     * @example
     * // Delete one Transaction
     * const Transaction = await prisma.transaction.delete({
     *   where: {
     *     // ... filter to delete one Transaction
     *   }
     * })
     * 
     */
    delete<T extends TransactionDeleteArgs>(args: SelectSubset<T, TransactionDeleteArgs<ExtArgs>>): Prisma__TransactionClient<$Result.GetResult<Prisma.$TransactionPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Transaction.
     * @param {TransactionUpdateArgs} args - Arguments to update one Transaction.
     * @example
     * // Update one Transaction
     * const transaction = await prisma.transaction.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends TransactionUpdateArgs>(args: SelectSubset<T, TransactionUpdateArgs<ExtArgs>>): Prisma__TransactionClient<$Result.GetResult<Prisma.$TransactionPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Transactions.
     * @param {TransactionDeleteManyArgs} args - Arguments to filter Transactions to delete.
     * @example
     * // Delete a few Transactions
     * const { count } = await prisma.transaction.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends TransactionDeleteManyArgs>(args?: SelectSubset<T, TransactionDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Transactions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TransactionUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Transactions
     * const transaction = await prisma.transaction.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends TransactionUpdateManyArgs>(args: SelectSubset<T, TransactionUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Transactions and returns the data updated in the database.
     * @param {TransactionUpdateManyAndReturnArgs} args - Arguments to update many Transactions.
     * @example
     * // Update many Transactions
     * const transaction = await prisma.transaction.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Transactions and only return the `id`
     * const transactionWithIdOnly = await prisma.transaction.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends TransactionUpdateManyAndReturnArgs>(args: SelectSubset<T, TransactionUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TransactionPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Transaction.
     * @param {TransactionUpsertArgs} args - Arguments to update or create a Transaction.
     * @example
     * // Update or create a Transaction
     * const transaction = await prisma.transaction.upsert({
     *   create: {
     *     // ... data to create a Transaction
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Transaction we want to update
     *   }
     * })
     */
    upsert<T extends TransactionUpsertArgs>(args: SelectSubset<T, TransactionUpsertArgs<ExtArgs>>): Prisma__TransactionClient<$Result.GetResult<Prisma.$TransactionPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Transactions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TransactionCountArgs} args - Arguments to filter Transactions to count.
     * @example
     * // Count the number of Transactions
     * const count = await prisma.transaction.count({
     *   where: {
     *     // ... the filter for the Transactions we want to count
     *   }
     * })
    **/
    count<T extends TransactionCountArgs>(
      args?: Subset<T, TransactionCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], TransactionCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Transaction.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TransactionAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends TransactionAggregateArgs>(args: Subset<T, TransactionAggregateArgs>): Prisma.PrismaPromise<GetTransactionAggregateType<T>>

    /**
     * Group by Transaction.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TransactionGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends TransactionGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: TransactionGroupByArgs['orderBy'] }
        : { orderBy?: TransactionGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, TransactionGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTransactionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Transaction model
   */
  readonly fields: TransactionFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Transaction.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__TransactionClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    client<T extends ClientDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ClientDefaultArgs<ExtArgs>>): Prisma__ClientClient<$Result.GetResult<Prisma.$ClientPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Transaction model
   */
  interface TransactionFieldRefs {
    readonly id: FieldRef<"Transaction", 'String'>
    readonly clientId: FieldRef<"Transaction", 'String'>
    readonly type: FieldRef<"Transaction", 'TransactionType'>
    readonly amount: FieldRef<"Transaction", 'Float'>
    readonly description: FieldRef<"Transaction", 'String'>
    readonly offerId: FieldRef<"Transaction", 'String'>
    readonly indicationId: FieldRef<"Transaction", 'String'>
    readonly createdAt: FieldRef<"Transaction", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Transaction findUnique
   */
  export type TransactionFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Transaction
     */
    select?: TransactionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Transaction
     */
    omit?: TransactionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionInclude<ExtArgs> | null
    /**
     * Filter, which Transaction to fetch.
     */
    where: TransactionWhereUniqueInput
  }

  /**
   * Transaction findUniqueOrThrow
   */
  export type TransactionFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Transaction
     */
    select?: TransactionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Transaction
     */
    omit?: TransactionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionInclude<ExtArgs> | null
    /**
     * Filter, which Transaction to fetch.
     */
    where: TransactionWhereUniqueInput
  }

  /**
   * Transaction findFirst
   */
  export type TransactionFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Transaction
     */
    select?: TransactionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Transaction
     */
    omit?: TransactionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionInclude<ExtArgs> | null
    /**
     * Filter, which Transaction to fetch.
     */
    where?: TransactionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Transactions to fetch.
     */
    orderBy?: TransactionOrderByWithRelationInput | TransactionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Transactions.
     */
    cursor?: TransactionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Transactions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Transactions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Transactions.
     */
    distinct?: TransactionScalarFieldEnum | TransactionScalarFieldEnum[]
  }

  /**
   * Transaction findFirstOrThrow
   */
  export type TransactionFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Transaction
     */
    select?: TransactionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Transaction
     */
    omit?: TransactionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionInclude<ExtArgs> | null
    /**
     * Filter, which Transaction to fetch.
     */
    where?: TransactionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Transactions to fetch.
     */
    orderBy?: TransactionOrderByWithRelationInput | TransactionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Transactions.
     */
    cursor?: TransactionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Transactions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Transactions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Transactions.
     */
    distinct?: TransactionScalarFieldEnum | TransactionScalarFieldEnum[]
  }

  /**
   * Transaction findMany
   */
  export type TransactionFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Transaction
     */
    select?: TransactionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Transaction
     */
    omit?: TransactionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionInclude<ExtArgs> | null
    /**
     * Filter, which Transactions to fetch.
     */
    where?: TransactionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Transactions to fetch.
     */
    orderBy?: TransactionOrderByWithRelationInput | TransactionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Transactions.
     */
    cursor?: TransactionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Transactions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Transactions.
     */
    skip?: number
    distinct?: TransactionScalarFieldEnum | TransactionScalarFieldEnum[]
  }

  /**
   * Transaction create
   */
  export type TransactionCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Transaction
     */
    select?: TransactionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Transaction
     */
    omit?: TransactionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionInclude<ExtArgs> | null
    /**
     * The data needed to create a Transaction.
     */
    data: XOR<TransactionCreateInput, TransactionUncheckedCreateInput>
  }

  /**
   * Transaction createMany
   */
  export type TransactionCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Transactions.
     */
    data: TransactionCreateManyInput | TransactionCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Transaction createManyAndReturn
   */
  export type TransactionCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Transaction
     */
    select?: TransactionSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Transaction
     */
    omit?: TransactionOmit<ExtArgs> | null
    /**
     * The data used to create many Transactions.
     */
    data: TransactionCreateManyInput | TransactionCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Transaction update
   */
  export type TransactionUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Transaction
     */
    select?: TransactionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Transaction
     */
    omit?: TransactionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionInclude<ExtArgs> | null
    /**
     * The data needed to update a Transaction.
     */
    data: XOR<TransactionUpdateInput, TransactionUncheckedUpdateInput>
    /**
     * Choose, which Transaction to update.
     */
    where: TransactionWhereUniqueInput
  }

  /**
   * Transaction updateMany
   */
  export type TransactionUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Transactions.
     */
    data: XOR<TransactionUpdateManyMutationInput, TransactionUncheckedUpdateManyInput>
    /**
     * Filter which Transactions to update
     */
    where?: TransactionWhereInput
    /**
     * Limit how many Transactions to update.
     */
    limit?: number
  }

  /**
   * Transaction updateManyAndReturn
   */
  export type TransactionUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Transaction
     */
    select?: TransactionSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Transaction
     */
    omit?: TransactionOmit<ExtArgs> | null
    /**
     * The data used to update Transactions.
     */
    data: XOR<TransactionUpdateManyMutationInput, TransactionUncheckedUpdateManyInput>
    /**
     * Filter which Transactions to update
     */
    where?: TransactionWhereInput
    /**
     * Limit how many Transactions to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Transaction upsert
   */
  export type TransactionUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Transaction
     */
    select?: TransactionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Transaction
     */
    omit?: TransactionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionInclude<ExtArgs> | null
    /**
     * The filter to search for the Transaction to update in case it exists.
     */
    where: TransactionWhereUniqueInput
    /**
     * In case the Transaction found by the `where` argument doesn't exist, create a new Transaction with this data.
     */
    create: XOR<TransactionCreateInput, TransactionUncheckedCreateInput>
    /**
     * In case the Transaction was found with the provided `where` argument, update it with this data.
     */
    update: XOR<TransactionUpdateInput, TransactionUncheckedUpdateInput>
  }

  /**
   * Transaction delete
   */
  export type TransactionDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Transaction
     */
    select?: TransactionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Transaction
     */
    omit?: TransactionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionInclude<ExtArgs> | null
    /**
     * Filter which Transaction to delete.
     */
    where: TransactionWhereUniqueInput
  }

  /**
   * Transaction deleteMany
   */
  export type TransactionDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Transactions to delete
     */
    where?: TransactionWhereInput
    /**
     * Limit how many Transactions to delete.
     */
    limit?: number
  }

  /**
   * Transaction without action
   */
  export type TransactionDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Transaction
     */
    select?: TransactionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Transaction
     */
    omit?: TransactionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionInclude<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const UserScalarFieldEnum: {
    id: 'id',
    email: 'email',
    name: 'name',
    password: 'password',
    roles: 'roles',
    permissions: 'permissions',
    clientId: 'clientId',
    isActive: 'isActive',
    resetPasswordToken: 'resetPasswordToken',
    resetPasswordExpires: 'resetPasswordExpires',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type UserScalarFieldEnum = (typeof UserScalarFieldEnum)[keyof typeof UserScalarFieldEnum]


  export const ClientScalarFieldEnum: {
    id: 'id',
    name: 'name',
    email: 'email',
    cpfCnpj: 'cpfCnpj',
    phone: 'phone',
    address: 'address',
    avgEnergyCost: 'avgEnergyCost',
    enelInvoiceFile: 'enelInvoiceFile',
    soloCoinBalance: 'soloCoinBalance',
    indicationCode: 'indicationCode',
    status: 'status',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    deletedAt: 'deletedAt'
  };

  export type ClientScalarFieldEnum = (typeof ClientScalarFieldEnum)[keyof typeof ClientScalarFieldEnum]


  export const InverterScalarFieldEnum: {
    id: 'id',
    provider: 'provider',
    providerId: 'providerId',
    providerApiKey: 'providerApiKey',
    providerApiSecret: 'providerApiSecret',
    providerUrl: 'providerUrl',
    clientId: 'clientId',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    deletedAt: 'deletedAt'
  };

  export type InverterScalarFieldEnum = (typeof InverterScalarFieldEnum)[keyof typeof InverterScalarFieldEnum]


  export const GenerationUnitScalarFieldEnum: {
    id: 'id',
    power: 'power',
    energy: 'energy',
    generationUnitType: 'generationUnitType',
    timestamp: 'timestamp',
    inverterId: 'inverterId',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    deletedAt: 'deletedAt'
  };

  export type GenerationUnitScalarFieldEnum = (typeof GenerationUnitScalarFieldEnum)[keyof typeof GenerationUnitScalarFieldEnum]


  export const IndicationScalarFieldEnum: {
    id: 'id',
    referrerId: 'referrerId',
    referredId: 'referredId',
    status: 'status',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type IndicationScalarFieldEnum = (typeof IndicationScalarFieldEnum)[keyof typeof IndicationScalarFieldEnum]


  export const OfferScalarFieldEnum: {
    id: 'id',
    title: 'title',
    description: 'description',
    partner: 'partner',
    cost: 'cost',
    discount: 'discount',
    imageUrl: 'imageUrl',
    validFrom: 'validFrom',
    validTo: 'validTo',
    isActive: 'isActive',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type OfferScalarFieldEnum = (typeof OfferScalarFieldEnum)[keyof typeof OfferScalarFieldEnum]


  export const FAQScalarFieldEnum: {
    id: 'id',
    question: 'question',
    answer: 'answer',
    category: 'category',
    isActive: 'isActive',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type FAQScalarFieldEnum = (typeof FAQScalarFieldEnum)[keyof typeof FAQScalarFieldEnum]


  export const TransactionScalarFieldEnum: {
    id: 'id',
    clientId: 'clientId',
    type: 'type',
    amount: 'amount',
    description: 'description',
    offerId: 'offerId',
    indicationId: 'indicationId',
    createdAt: 'createdAt'
  };

  export type TransactionScalarFieldEnum = (typeof TransactionScalarFieldEnum)[keyof typeof TransactionScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    


  /**
   * Reference to a field of type 'ClientStatus'
   */
  export type EnumClientStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ClientStatus'>
    


  /**
   * Reference to a field of type 'ClientStatus[]'
   */
  export type ListEnumClientStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ClientStatus[]'>
    


  /**
   * Reference to a field of type 'IndicationStatus'
   */
  export type EnumIndicationStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'IndicationStatus'>
    


  /**
   * Reference to a field of type 'IndicationStatus[]'
   */
  export type ListEnumIndicationStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'IndicationStatus[]'>
    


  /**
   * Reference to a field of type 'TransactionType'
   */
  export type EnumTransactionTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'TransactionType'>
    


  /**
   * Reference to a field of type 'TransactionType[]'
   */
  export type ListEnumTransactionTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'TransactionType[]'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    
  /**
   * Deep Input Types
   */


  export type UserWhereInput = {
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    id?: StringFilter<"User"> | string
    email?: StringFilter<"User"> | string
    name?: StringFilter<"User"> | string
    password?: StringFilter<"User"> | string
    roles?: StringNullableListFilter<"User">
    permissions?: StringNullableListFilter<"User">
    clientId?: StringNullableFilter<"User"> | string | null
    isActive?: BoolFilter<"User"> | boolean
    resetPasswordToken?: StringNullableFilter<"User"> | string | null
    resetPasswordExpires?: DateTimeNullableFilter<"User"> | Date | string | null
    createdAt?: DateTimeFilter<"User"> | Date | string
    updatedAt?: DateTimeFilter<"User"> | Date | string
    client?: XOR<ClientNullableScalarRelationFilter, ClientWhereInput> | null
  }

  export type UserOrderByWithRelationInput = {
    id?: SortOrder
    email?: SortOrder
    name?: SortOrder
    password?: SortOrder
    roles?: SortOrder
    permissions?: SortOrder
    clientId?: SortOrderInput | SortOrder
    isActive?: SortOrder
    resetPasswordToken?: SortOrderInput | SortOrder
    resetPasswordExpires?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    client?: ClientOrderByWithRelationInput
  }

  export type UserWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    email?: string
    resetPasswordToken?: string
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    name?: StringFilter<"User"> | string
    password?: StringFilter<"User"> | string
    roles?: StringNullableListFilter<"User">
    permissions?: StringNullableListFilter<"User">
    clientId?: StringNullableFilter<"User"> | string | null
    isActive?: BoolFilter<"User"> | boolean
    resetPasswordExpires?: DateTimeNullableFilter<"User"> | Date | string | null
    createdAt?: DateTimeFilter<"User"> | Date | string
    updatedAt?: DateTimeFilter<"User"> | Date | string
    client?: XOR<ClientNullableScalarRelationFilter, ClientWhereInput> | null
  }, "id" | "email" | "resetPasswordToken">

  export type UserOrderByWithAggregationInput = {
    id?: SortOrder
    email?: SortOrder
    name?: SortOrder
    password?: SortOrder
    roles?: SortOrder
    permissions?: SortOrder
    clientId?: SortOrderInput | SortOrder
    isActive?: SortOrder
    resetPasswordToken?: SortOrderInput | SortOrder
    resetPasswordExpires?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: UserCountOrderByAggregateInput
    _max?: UserMaxOrderByAggregateInput
    _min?: UserMinOrderByAggregateInput
  }

  export type UserScalarWhereWithAggregatesInput = {
    AND?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    OR?: UserScalarWhereWithAggregatesInput[]
    NOT?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"User"> | string
    email?: StringWithAggregatesFilter<"User"> | string
    name?: StringWithAggregatesFilter<"User"> | string
    password?: StringWithAggregatesFilter<"User"> | string
    roles?: StringNullableListFilter<"User">
    permissions?: StringNullableListFilter<"User">
    clientId?: StringNullableWithAggregatesFilter<"User"> | string | null
    isActive?: BoolWithAggregatesFilter<"User"> | boolean
    resetPasswordToken?: StringNullableWithAggregatesFilter<"User"> | string | null
    resetPasswordExpires?: DateTimeNullableWithAggregatesFilter<"User"> | Date | string | null
    createdAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
  }

  export type ClientWhereInput = {
    AND?: ClientWhereInput | ClientWhereInput[]
    OR?: ClientWhereInput[]
    NOT?: ClientWhereInput | ClientWhereInput[]
    id?: StringFilter<"Client"> | string
    name?: StringFilter<"Client"> | string
    email?: StringFilter<"Client"> | string
    cpfCnpj?: StringFilter<"Client"> | string
    phone?: StringNullableFilter<"Client"> | string | null
    address?: StringNullableFilter<"Client"> | string | null
    avgEnergyCost?: FloatNullableFilter<"Client"> | number | null
    enelInvoiceFile?: StringNullableFilter<"Client"> | string | null
    soloCoinBalance?: FloatFilter<"Client"> | number
    indicationCode?: StringFilter<"Client"> | string
    status?: EnumClientStatusFilter<"Client"> | $Enums.ClientStatus
    createdAt?: DateTimeFilter<"Client"> | Date | string
    updatedAt?: DateTimeFilter<"Client"> | Date | string
    deletedAt?: DateTimeNullableFilter<"Client"> | Date | string | null
    inverters?: InverterListRelationFilter
    users?: UserListRelationFilter
    indicationsAsReferrer?: IndicationListRelationFilter
    indicationsAsReferred?: IndicationListRelationFilter
    transactions?: TransactionListRelationFilter
  }

  export type ClientOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    email?: SortOrder
    cpfCnpj?: SortOrder
    phone?: SortOrderInput | SortOrder
    address?: SortOrderInput | SortOrder
    avgEnergyCost?: SortOrderInput | SortOrder
    enelInvoiceFile?: SortOrderInput | SortOrder
    soloCoinBalance?: SortOrder
    indicationCode?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    deletedAt?: SortOrderInput | SortOrder
    inverters?: InverterOrderByRelationAggregateInput
    users?: UserOrderByRelationAggregateInput
    indicationsAsReferrer?: IndicationOrderByRelationAggregateInput
    indicationsAsReferred?: IndicationOrderByRelationAggregateInput
    transactions?: TransactionOrderByRelationAggregateInput
  }

  export type ClientWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    email?: string
    cpfCnpj?: string
    indicationCode?: string
    AND?: ClientWhereInput | ClientWhereInput[]
    OR?: ClientWhereInput[]
    NOT?: ClientWhereInput | ClientWhereInput[]
    name?: StringFilter<"Client"> | string
    phone?: StringNullableFilter<"Client"> | string | null
    address?: StringNullableFilter<"Client"> | string | null
    avgEnergyCost?: FloatNullableFilter<"Client"> | number | null
    enelInvoiceFile?: StringNullableFilter<"Client"> | string | null
    soloCoinBalance?: FloatFilter<"Client"> | number
    status?: EnumClientStatusFilter<"Client"> | $Enums.ClientStatus
    createdAt?: DateTimeFilter<"Client"> | Date | string
    updatedAt?: DateTimeFilter<"Client"> | Date | string
    deletedAt?: DateTimeNullableFilter<"Client"> | Date | string | null
    inverters?: InverterListRelationFilter
    users?: UserListRelationFilter
    indicationsAsReferrer?: IndicationListRelationFilter
    indicationsAsReferred?: IndicationListRelationFilter
    transactions?: TransactionListRelationFilter
  }, "id" | "email" | "cpfCnpj" | "indicationCode">

  export type ClientOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    email?: SortOrder
    cpfCnpj?: SortOrder
    phone?: SortOrderInput | SortOrder
    address?: SortOrderInput | SortOrder
    avgEnergyCost?: SortOrderInput | SortOrder
    enelInvoiceFile?: SortOrderInput | SortOrder
    soloCoinBalance?: SortOrder
    indicationCode?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    deletedAt?: SortOrderInput | SortOrder
    _count?: ClientCountOrderByAggregateInput
    _avg?: ClientAvgOrderByAggregateInput
    _max?: ClientMaxOrderByAggregateInput
    _min?: ClientMinOrderByAggregateInput
    _sum?: ClientSumOrderByAggregateInput
  }

  export type ClientScalarWhereWithAggregatesInput = {
    AND?: ClientScalarWhereWithAggregatesInput | ClientScalarWhereWithAggregatesInput[]
    OR?: ClientScalarWhereWithAggregatesInput[]
    NOT?: ClientScalarWhereWithAggregatesInput | ClientScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Client"> | string
    name?: StringWithAggregatesFilter<"Client"> | string
    email?: StringWithAggregatesFilter<"Client"> | string
    cpfCnpj?: StringWithAggregatesFilter<"Client"> | string
    phone?: StringNullableWithAggregatesFilter<"Client"> | string | null
    address?: StringNullableWithAggregatesFilter<"Client"> | string | null
    avgEnergyCost?: FloatNullableWithAggregatesFilter<"Client"> | number | null
    enelInvoiceFile?: StringNullableWithAggregatesFilter<"Client"> | string | null
    soloCoinBalance?: FloatWithAggregatesFilter<"Client"> | number
    indicationCode?: StringWithAggregatesFilter<"Client"> | string
    status?: EnumClientStatusWithAggregatesFilter<"Client"> | $Enums.ClientStatus
    createdAt?: DateTimeWithAggregatesFilter<"Client"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Client"> | Date | string
    deletedAt?: DateTimeNullableWithAggregatesFilter<"Client"> | Date | string | null
  }

  export type InverterWhereInput = {
    AND?: InverterWhereInput | InverterWhereInput[]
    OR?: InverterWhereInput[]
    NOT?: InverterWhereInput | InverterWhereInput[]
    id?: StringFilter<"Inverter"> | string
    provider?: StringFilter<"Inverter"> | string
    providerId?: StringFilter<"Inverter"> | string
    providerApiKey?: StringNullableFilter<"Inverter"> | string | null
    providerApiSecret?: StringNullableFilter<"Inverter"> | string | null
    providerUrl?: StringNullableFilter<"Inverter"> | string | null
    clientId?: StringFilter<"Inverter"> | string
    createdAt?: DateTimeFilter<"Inverter"> | Date | string
    updatedAt?: DateTimeFilter<"Inverter"> | Date | string
    deletedAt?: DateTimeNullableFilter<"Inverter"> | Date | string | null
    client?: XOR<ClientScalarRelationFilter, ClientWhereInput>
    generationUnits?: GenerationUnitListRelationFilter
  }

  export type InverterOrderByWithRelationInput = {
    id?: SortOrder
    provider?: SortOrder
    providerId?: SortOrder
    providerApiKey?: SortOrderInput | SortOrder
    providerApiSecret?: SortOrderInput | SortOrder
    providerUrl?: SortOrderInput | SortOrder
    clientId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    deletedAt?: SortOrderInput | SortOrder
    client?: ClientOrderByWithRelationInput
    generationUnits?: GenerationUnitOrderByRelationAggregateInput
  }

  export type InverterWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: InverterWhereInput | InverterWhereInput[]
    OR?: InverterWhereInput[]
    NOT?: InverterWhereInput | InverterWhereInput[]
    provider?: StringFilter<"Inverter"> | string
    providerId?: StringFilter<"Inverter"> | string
    providerApiKey?: StringNullableFilter<"Inverter"> | string | null
    providerApiSecret?: StringNullableFilter<"Inverter"> | string | null
    providerUrl?: StringNullableFilter<"Inverter"> | string | null
    clientId?: StringFilter<"Inverter"> | string
    createdAt?: DateTimeFilter<"Inverter"> | Date | string
    updatedAt?: DateTimeFilter<"Inverter"> | Date | string
    deletedAt?: DateTimeNullableFilter<"Inverter"> | Date | string | null
    client?: XOR<ClientScalarRelationFilter, ClientWhereInput>
    generationUnits?: GenerationUnitListRelationFilter
  }, "id">

  export type InverterOrderByWithAggregationInput = {
    id?: SortOrder
    provider?: SortOrder
    providerId?: SortOrder
    providerApiKey?: SortOrderInput | SortOrder
    providerApiSecret?: SortOrderInput | SortOrder
    providerUrl?: SortOrderInput | SortOrder
    clientId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    deletedAt?: SortOrderInput | SortOrder
    _count?: InverterCountOrderByAggregateInput
    _max?: InverterMaxOrderByAggregateInput
    _min?: InverterMinOrderByAggregateInput
  }

  export type InverterScalarWhereWithAggregatesInput = {
    AND?: InverterScalarWhereWithAggregatesInput | InverterScalarWhereWithAggregatesInput[]
    OR?: InverterScalarWhereWithAggregatesInput[]
    NOT?: InverterScalarWhereWithAggregatesInput | InverterScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Inverter"> | string
    provider?: StringWithAggregatesFilter<"Inverter"> | string
    providerId?: StringWithAggregatesFilter<"Inverter"> | string
    providerApiKey?: StringNullableWithAggregatesFilter<"Inverter"> | string | null
    providerApiSecret?: StringNullableWithAggregatesFilter<"Inverter"> | string | null
    providerUrl?: StringNullableWithAggregatesFilter<"Inverter"> | string | null
    clientId?: StringWithAggregatesFilter<"Inverter"> | string
    createdAt?: DateTimeWithAggregatesFilter<"Inverter"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Inverter"> | Date | string
    deletedAt?: DateTimeNullableWithAggregatesFilter<"Inverter"> | Date | string | null
  }

  export type GenerationUnitWhereInput = {
    AND?: GenerationUnitWhereInput | GenerationUnitWhereInput[]
    OR?: GenerationUnitWhereInput[]
    NOT?: GenerationUnitWhereInput | GenerationUnitWhereInput[]
    id?: StringFilter<"GenerationUnit"> | string
    power?: FloatFilter<"GenerationUnit"> | number
    energy?: FloatFilter<"GenerationUnit"> | number
    generationUnitType?: StringFilter<"GenerationUnit"> | string
    timestamp?: DateTimeFilter<"GenerationUnit"> | Date | string
    inverterId?: StringFilter<"GenerationUnit"> | string
    createdAt?: DateTimeFilter<"GenerationUnit"> | Date | string
    updatedAt?: DateTimeFilter<"GenerationUnit"> | Date | string
    deletedAt?: DateTimeNullableFilter<"GenerationUnit"> | Date | string | null
    inverter?: XOR<InverterScalarRelationFilter, InverterWhereInput>
  }

  export type GenerationUnitOrderByWithRelationInput = {
    id?: SortOrder
    power?: SortOrder
    energy?: SortOrder
    generationUnitType?: SortOrder
    timestamp?: SortOrder
    inverterId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    deletedAt?: SortOrderInput | SortOrder
    inverter?: InverterOrderByWithRelationInput
  }

  export type GenerationUnitWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: GenerationUnitWhereInput | GenerationUnitWhereInput[]
    OR?: GenerationUnitWhereInput[]
    NOT?: GenerationUnitWhereInput | GenerationUnitWhereInput[]
    power?: FloatFilter<"GenerationUnit"> | number
    energy?: FloatFilter<"GenerationUnit"> | number
    generationUnitType?: StringFilter<"GenerationUnit"> | string
    timestamp?: DateTimeFilter<"GenerationUnit"> | Date | string
    inverterId?: StringFilter<"GenerationUnit"> | string
    createdAt?: DateTimeFilter<"GenerationUnit"> | Date | string
    updatedAt?: DateTimeFilter<"GenerationUnit"> | Date | string
    deletedAt?: DateTimeNullableFilter<"GenerationUnit"> | Date | string | null
    inverter?: XOR<InverterScalarRelationFilter, InverterWhereInput>
  }, "id">

  export type GenerationUnitOrderByWithAggregationInput = {
    id?: SortOrder
    power?: SortOrder
    energy?: SortOrder
    generationUnitType?: SortOrder
    timestamp?: SortOrder
    inverterId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    deletedAt?: SortOrderInput | SortOrder
    _count?: GenerationUnitCountOrderByAggregateInput
    _avg?: GenerationUnitAvgOrderByAggregateInput
    _max?: GenerationUnitMaxOrderByAggregateInput
    _min?: GenerationUnitMinOrderByAggregateInput
    _sum?: GenerationUnitSumOrderByAggregateInput
  }

  export type GenerationUnitScalarWhereWithAggregatesInput = {
    AND?: GenerationUnitScalarWhereWithAggregatesInput | GenerationUnitScalarWhereWithAggregatesInput[]
    OR?: GenerationUnitScalarWhereWithAggregatesInput[]
    NOT?: GenerationUnitScalarWhereWithAggregatesInput | GenerationUnitScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"GenerationUnit"> | string
    power?: FloatWithAggregatesFilter<"GenerationUnit"> | number
    energy?: FloatWithAggregatesFilter<"GenerationUnit"> | number
    generationUnitType?: StringWithAggregatesFilter<"GenerationUnit"> | string
    timestamp?: DateTimeWithAggregatesFilter<"GenerationUnit"> | Date | string
    inverterId?: StringWithAggregatesFilter<"GenerationUnit"> | string
    createdAt?: DateTimeWithAggregatesFilter<"GenerationUnit"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"GenerationUnit"> | Date | string
    deletedAt?: DateTimeNullableWithAggregatesFilter<"GenerationUnit"> | Date | string | null
  }

  export type IndicationWhereInput = {
    AND?: IndicationWhereInput | IndicationWhereInput[]
    OR?: IndicationWhereInput[]
    NOT?: IndicationWhereInput | IndicationWhereInput[]
    id?: StringFilter<"Indication"> | string
    referrerId?: StringFilter<"Indication"> | string
    referredId?: StringFilter<"Indication"> | string
    status?: EnumIndicationStatusFilter<"Indication"> | $Enums.IndicationStatus
    createdAt?: DateTimeFilter<"Indication"> | Date | string
    updatedAt?: DateTimeFilter<"Indication"> | Date | string
    referrer?: XOR<ClientScalarRelationFilter, ClientWhereInput>
    referred?: XOR<ClientScalarRelationFilter, ClientWhereInput>
  }

  export type IndicationOrderByWithRelationInput = {
    id?: SortOrder
    referrerId?: SortOrder
    referredId?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    referrer?: ClientOrderByWithRelationInput
    referred?: ClientOrderByWithRelationInput
  }

  export type IndicationWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: IndicationWhereInput | IndicationWhereInput[]
    OR?: IndicationWhereInput[]
    NOT?: IndicationWhereInput | IndicationWhereInput[]
    referrerId?: StringFilter<"Indication"> | string
    referredId?: StringFilter<"Indication"> | string
    status?: EnumIndicationStatusFilter<"Indication"> | $Enums.IndicationStatus
    createdAt?: DateTimeFilter<"Indication"> | Date | string
    updatedAt?: DateTimeFilter<"Indication"> | Date | string
    referrer?: XOR<ClientScalarRelationFilter, ClientWhereInput>
    referred?: XOR<ClientScalarRelationFilter, ClientWhereInput>
  }, "id">

  export type IndicationOrderByWithAggregationInput = {
    id?: SortOrder
    referrerId?: SortOrder
    referredId?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: IndicationCountOrderByAggregateInput
    _max?: IndicationMaxOrderByAggregateInput
    _min?: IndicationMinOrderByAggregateInput
  }

  export type IndicationScalarWhereWithAggregatesInput = {
    AND?: IndicationScalarWhereWithAggregatesInput | IndicationScalarWhereWithAggregatesInput[]
    OR?: IndicationScalarWhereWithAggregatesInput[]
    NOT?: IndicationScalarWhereWithAggregatesInput | IndicationScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Indication"> | string
    referrerId?: StringWithAggregatesFilter<"Indication"> | string
    referredId?: StringWithAggregatesFilter<"Indication"> | string
    status?: EnumIndicationStatusWithAggregatesFilter<"Indication"> | $Enums.IndicationStatus
    createdAt?: DateTimeWithAggregatesFilter<"Indication"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Indication"> | Date | string
  }

  export type OfferWhereInput = {
    AND?: OfferWhereInput | OfferWhereInput[]
    OR?: OfferWhereInput[]
    NOT?: OfferWhereInput | OfferWhereInput[]
    id?: StringFilter<"Offer"> | string
    title?: StringFilter<"Offer"> | string
    description?: StringFilter<"Offer"> | string
    partner?: StringFilter<"Offer"> | string
    cost?: FloatFilter<"Offer"> | number
    discount?: StringNullableFilter<"Offer"> | string | null
    imageUrl?: StringNullableFilter<"Offer"> | string | null
    validFrom?: DateTimeNullableFilter<"Offer"> | Date | string | null
    validTo?: DateTimeNullableFilter<"Offer"> | Date | string | null
    isActive?: BoolFilter<"Offer"> | boolean
    createdAt?: DateTimeFilter<"Offer"> | Date | string
    updatedAt?: DateTimeFilter<"Offer"> | Date | string
  }

  export type OfferOrderByWithRelationInput = {
    id?: SortOrder
    title?: SortOrder
    description?: SortOrder
    partner?: SortOrder
    cost?: SortOrder
    discount?: SortOrderInput | SortOrder
    imageUrl?: SortOrderInput | SortOrder
    validFrom?: SortOrderInput | SortOrder
    validTo?: SortOrderInput | SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type OfferWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: OfferWhereInput | OfferWhereInput[]
    OR?: OfferWhereInput[]
    NOT?: OfferWhereInput | OfferWhereInput[]
    title?: StringFilter<"Offer"> | string
    description?: StringFilter<"Offer"> | string
    partner?: StringFilter<"Offer"> | string
    cost?: FloatFilter<"Offer"> | number
    discount?: StringNullableFilter<"Offer"> | string | null
    imageUrl?: StringNullableFilter<"Offer"> | string | null
    validFrom?: DateTimeNullableFilter<"Offer"> | Date | string | null
    validTo?: DateTimeNullableFilter<"Offer"> | Date | string | null
    isActive?: BoolFilter<"Offer"> | boolean
    createdAt?: DateTimeFilter<"Offer"> | Date | string
    updatedAt?: DateTimeFilter<"Offer"> | Date | string
  }, "id">

  export type OfferOrderByWithAggregationInput = {
    id?: SortOrder
    title?: SortOrder
    description?: SortOrder
    partner?: SortOrder
    cost?: SortOrder
    discount?: SortOrderInput | SortOrder
    imageUrl?: SortOrderInput | SortOrder
    validFrom?: SortOrderInput | SortOrder
    validTo?: SortOrderInput | SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: OfferCountOrderByAggregateInput
    _avg?: OfferAvgOrderByAggregateInput
    _max?: OfferMaxOrderByAggregateInput
    _min?: OfferMinOrderByAggregateInput
    _sum?: OfferSumOrderByAggregateInput
  }

  export type OfferScalarWhereWithAggregatesInput = {
    AND?: OfferScalarWhereWithAggregatesInput | OfferScalarWhereWithAggregatesInput[]
    OR?: OfferScalarWhereWithAggregatesInput[]
    NOT?: OfferScalarWhereWithAggregatesInput | OfferScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Offer"> | string
    title?: StringWithAggregatesFilter<"Offer"> | string
    description?: StringWithAggregatesFilter<"Offer"> | string
    partner?: StringWithAggregatesFilter<"Offer"> | string
    cost?: FloatWithAggregatesFilter<"Offer"> | number
    discount?: StringNullableWithAggregatesFilter<"Offer"> | string | null
    imageUrl?: StringNullableWithAggregatesFilter<"Offer"> | string | null
    validFrom?: DateTimeNullableWithAggregatesFilter<"Offer"> | Date | string | null
    validTo?: DateTimeNullableWithAggregatesFilter<"Offer"> | Date | string | null
    isActive?: BoolWithAggregatesFilter<"Offer"> | boolean
    createdAt?: DateTimeWithAggregatesFilter<"Offer"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Offer"> | Date | string
  }

  export type FAQWhereInput = {
    AND?: FAQWhereInput | FAQWhereInput[]
    OR?: FAQWhereInput[]
    NOT?: FAQWhereInput | FAQWhereInput[]
    id?: StringFilter<"FAQ"> | string
    question?: StringFilter<"FAQ"> | string
    answer?: StringFilter<"FAQ"> | string
    category?: StringNullableFilter<"FAQ"> | string | null
    isActive?: BoolFilter<"FAQ"> | boolean
    createdAt?: DateTimeFilter<"FAQ"> | Date | string
    updatedAt?: DateTimeFilter<"FAQ"> | Date | string
  }

  export type FAQOrderByWithRelationInput = {
    id?: SortOrder
    question?: SortOrder
    answer?: SortOrder
    category?: SortOrderInput | SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type FAQWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: FAQWhereInput | FAQWhereInput[]
    OR?: FAQWhereInput[]
    NOT?: FAQWhereInput | FAQWhereInput[]
    question?: StringFilter<"FAQ"> | string
    answer?: StringFilter<"FAQ"> | string
    category?: StringNullableFilter<"FAQ"> | string | null
    isActive?: BoolFilter<"FAQ"> | boolean
    createdAt?: DateTimeFilter<"FAQ"> | Date | string
    updatedAt?: DateTimeFilter<"FAQ"> | Date | string
  }, "id">

  export type FAQOrderByWithAggregationInput = {
    id?: SortOrder
    question?: SortOrder
    answer?: SortOrder
    category?: SortOrderInput | SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: FAQCountOrderByAggregateInput
    _max?: FAQMaxOrderByAggregateInput
    _min?: FAQMinOrderByAggregateInput
  }

  export type FAQScalarWhereWithAggregatesInput = {
    AND?: FAQScalarWhereWithAggregatesInput | FAQScalarWhereWithAggregatesInput[]
    OR?: FAQScalarWhereWithAggregatesInput[]
    NOT?: FAQScalarWhereWithAggregatesInput | FAQScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"FAQ"> | string
    question?: StringWithAggregatesFilter<"FAQ"> | string
    answer?: StringWithAggregatesFilter<"FAQ"> | string
    category?: StringNullableWithAggregatesFilter<"FAQ"> | string | null
    isActive?: BoolWithAggregatesFilter<"FAQ"> | boolean
    createdAt?: DateTimeWithAggregatesFilter<"FAQ"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"FAQ"> | Date | string
  }

  export type TransactionWhereInput = {
    AND?: TransactionWhereInput | TransactionWhereInput[]
    OR?: TransactionWhereInput[]
    NOT?: TransactionWhereInput | TransactionWhereInput[]
    id?: StringFilter<"Transaction"> | string
    clientId?: StringFilter<"Transaction"> | string
    type?: EnumTransactionTypeFilter<"Transaction"> | $Enums.TransactionType
    amount?: FloatFilter<"Transaction"> | number
    description?: StringNullableFilter<"Transaction"> | string | null
    offerId?: StringNullableFilter<"Transaction"> | string | null
    indicationId?: StringNullableFilter<"Transaction"> | string | null
    createdAt?: DateTimeFilter<"Transaction"> | Date | string
    client?: XOR<ClientScalarRelationFilter, ClientWhereInput>
  }

  export type TransactionOrderByWithRelationInput = {
    id?: SortOrder
    clientId?: SortOrder
    type?: SortOrder
    amount?: SortOrder
    description?: SortOrderInput | SortOrder
    offerId?: SortOrderInput | SortOrder
    indicationId?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    client?: ClientOrderByWithRelationInput
  }

  export type TransactionWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: TransactionWhereInput | TransactionWhereInput[]
    OR?: TransactionWhereInput[]
    NOT?: TransactionWhereInput | TransactionWhereInput[]
    clientId?: StringFilter<"Transaction"> | string
    type?: EnumTransactionTypeFilter<"Transaction"> | $Enums.TransactionType
    amount?: FloatFilter<"Transaction"> | number
    description?: StringNullableFilter<"Transaction"> | string | null
    offerId?: StringNullableFilter<"Transaction"> | string | null
    indicationId?: StringNullableFilter<"Transaction"> | string | null
    createdAt?: DateTimeFilter<"Transaction"> | Date | string
    client?: XOR<ClientScalarRelationFilter, ClientWhereInput>
  }, "id">

  export type TransactionOrderByWithAggregationInput = {
    id?: SortOrder
    clientId?: SortOrder
    type?: SortOrder
    amount?: SortOrder
    description?: SortOrderInput | SortOrder
    offerId?: SortOrderInput | SortOrder
    indicationId?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    _count?: TransactionCountOrderByAggregateInput
    _avg?: TransactionAvgOrderByAggregateInput
    _max?: TransactionMaxOrderByAggregateInput
    _min?: TransactionMinOrderByAggregateInput
    _sum?: TransactionSumOrderByAggregateInput
  }

  export type TransactionScalarWhereWithAggregatesInput = {
    AND?: TransactionScalarWhereWithAggregatesInput | TransactionScalarWhereWithAggregatesInput[]
    OR?: TransactionScalarWhereWithAggregatesInput[]
    NOT?: TransactionScalarWhereWithAggregatesInput | TransactionScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Transaction"> | string
    clientId?: StringWithAggregatesFilter<"Transaction"> | string
    type?: EnumTransactionTypeWithAggregatesFilter<"Transaction"> | $Enums.TransactionType
    amount?: FloatWithAggregatesFilter<"Transaction"> | number
    description?: StringNullableWithAggregatesFilter<"Transaction"> | string | null
    offerId?: StringNullableWithAggregatesFilter<"Transaction"> | string | null
    indicationId?: StringNullableWithAggregatesFilter<"Transaction"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"Transaction"> | Date | string
  }

  export type UserCreateInput = {
    id?: string
    email: string
    name: string
    password: string
    roles?: UserCreaterolesInput | string[]
    permissions?: UserCreatepermissionsInput | string[]
    isActive?: boolean
    resetPasswordToken?: string | null
    resetPasswordExpires?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    client?: ClientCreateNestedOneWithoutUsersInput
  }

  export type UserUncheckedCreateInput = {
    id?: string
    email: string
    name: string
    password: string
    roles?: UserCreaterolesInput | string[]
    permissions?: UserCreatepermissionsInput | string[]
    clientId?: string | null
    isActive?: boolean
    resetPasswordToken?: string | null
    resetPasswordExpires?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    roles?: UserUpdaterolesInput | string[]
    permissions?: UserUpdatepermissionsInput | string[]
    isActive?: BoolFieldUpdateOperationsInput | boolean
    resetPasswordToken?: NullableStringFieldUpdateOperationsInput | string | null
    resetPasswordExpires?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    client?: ClientUpdateOneWithoutUsersNestedInput
  }

  export type UserUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    roles?: UserUpdaterolesInput | string[]
    permissions?: UserUpdatepermissionsInput | string[]
    clientId?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    resetPasswordToken?: NullableStringFieldUpdateOperationsInput | string | null
    resetPasswordExpires?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserCreateManyInput = {
    id?: string
    email: string
    name: string
    password: string
    roles?: UserCreaterolesInput | string[]
    permissions?: UserCreatepermissionsInput | string[]
    clientId?: string | null
    isActive?: boolean
    resetPasswordToken?: string | null
    resetPasswordExpires?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    roles?: UserUpdaterolesInput | string[]
    permissions?: UserUpdatepermissionsInput | string[]
    isActive?: BoolFieldUpdateOperationsInput | boolean
    resetPasswordToken?: NullableStringFieldUpdateOperationsInput | string | null
    resetPasswordExpires?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    roles?: UserUpdaterolesInput | string[]
    permissions?: UserUpdatepermissionsInput | string[]
    clientId?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    resetPasswordToken?: NullableStringFieldUpdateOperationsInput | string | null
    resetPasswordExpires?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ClientCreateInput = {
    id?: string
    name: string
    email: string
    cpfCnpj: string
    phone?: string | null
    address?: string | null
    avgEnergyCost?: number | null
    enelInvoiceFile?: string | null
    soloCoinBalance?: number
    indicationCode: string
    status?: $Enums.ClientStatus
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    inverters?: InverterCreateNestedManyWithoutClientInput
    users?: UserCreateNestedManyWithoutClientInput
    indicationsAsReferrer?: IndicationCreateNestedManyWithoutReferrerInput
    indicationsAsReferred?: IndicationCreateNestedManyWithoutReferredInput
    transactions?: TransactionCreateNestedManyWithoutClientInput
  }

  export type ClientUncheckedCreateInput = {
    id?: string
    name: string
    email: string
    cpfCnpj: string
    phone?: string | null
    address?: string | null
    avgEnergyCost?: number | null
    enelInvoiceFile?: string | null
    soloCoinBalance?: number
    indicationCode: string
    status?: $Enums.ClientStatus
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    inverters?: InverterUncheckedCreateNestedManyWithoutClientInput
    users?: UserUncheckedCreateNestedManyWithoutClientInput
    indicationsAsReferrer?: IndicationUncheckedCreateNestedManyWithoutReferrerInput
    indicationsAsReferred?: IndicationUncheckedCreateNestedManyWithoutReferredInput
    transactions?: TransactionUncheckedCreateNestedManyWithoutClientInput
  }

  export type ClientUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    cpfCnpj?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    address?: NullableStringFieldUpdateOperationsInput | string | null
    avgEnergyCost?: NullableFloatFieldUpdateOperationsInput | number | null
    enelInvoiceFile?: NullableStringFieldUpdateOperationsInput | string | null
    soloCoinBalance?: FloatFieldUpdateOperationsInput | number
    indicationCode?: StringFieldUpdateOperationsInput | string
    status?: EnumClientStatusFieldUpdateOperationsInput | $Enums.ClientStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    inverters?: InverterUpdateManyWithoutClientNestedInput
    users?: UserUpdateManyWithoutClientNestedInput
    indicationsAsReferrer?: IndicationUpdateManyWithoutReferrerNestedInput
    indicationsAsReferred?: IndicationUpdateManyWithoutReferredNestedInput
    transactions?: TransactionUpdateManyWithoutClientNestedInput
  }

  export type ClientUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    cpfCnpj?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    address?: NullableStringFieldUpdateOperationsInput | string | null
    avgEnergyCost?: NullableFloatFieldUpdateOperationsInput | number | null
    enelInvoiceFile?: NullableStringFieldUpdateOperationsInput | string | null
    soloCoinBalance?: FloatFieldUpdateOperationsInput | number
    indicationCode?: StringFieldUpdateOperationsInput | string
    status?: EnumClientStatusFieldUpdateOperationsInput | $Enums.ClientStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    inverters?: InverterUncheckedUpdateManyWithoutClientNestedInput
    users?: UserUncheckedUpdateManyWithoutClientNestedInput
    indicationsAsReferrer?: IndicationUncheckedUpdateManyWithoutReferrerNestedInput
    indicationsAsReferred?: IndicationUncheckedUpdateManyWithoutReferredNestedInput
    transactions?: TransactionUncheckedUpdateManyWithoutClientNestedInput
  }

  export type ClientCreateManyInput = {
    id?: string
    name: string
    email: string
    cpfCnpj: string
    phone?: string | null
    address?: string | null
    avgEnergyCost?: number | null
    enelInvoiceFile?: string | null
    soloCoinBalance?: number
    indicationCode: string
    status?: $Enums.ClientStatus
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
  }

  export type ClientUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    cpfCnpj?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    address?: NullableStringFieldUpdateOperationsInput | string | null
    avgEnergyCost?: NullableFloatFieldUpdateOperationsInput | number | null
    enelInvoiceFile?: NullableStringFieldUpdateOperationsInput | string | null
    soloCoinBalance?: FloatFieldUpdateOperationsInput | number
    indicationCode?: StringFieldUpdateOperationsInput | string
    status?: EnumClientStatusFieldUpdateOperationsInput | $Enums.ClientStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type ClientUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    cpfCnpj?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    address?: NullableStringFieldUpdateOperationsInput | string | null
    avgEnergyCost?: NullableFloatFieldUpdateOperationsInput | number | null
    enelInvoiceFile?: NullableStringFieldUpdateOperationsInput | string | null
    soloCoinBalance?: FloatFieldUpdateOperationsInput | number
    indicationCode?: StringFieldUpdateOperationsInput | string
    status?: EnumClientStatusFieldUpdateOperationsInput | $Enums.ClientStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type InverterCreateInput = {
    id?: string
    provider: string
    providerId: string
    providerApiKey?: string | null
    providerApiSecret?: string | null
    providerUrl?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    client: ClientCreateNestedOneWithoutInvertersInput
    generationUnits?: GenerationUnitCreateNestedManyWithoutInverterInput
  }

  export type InverterUncheckedCreateInput = {
    id?: string
    provider: string
    providerId: string
    providerApiKey?: string | null
    providerApiSecret?: string | null
    providerUrl?: string | null
    clientId: string
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    generationUnits?: GenerationUnitUncheckedCreateNestedManyWithoutInverterInput
  }

  export type InverterUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    provider?: StringFieldUpdateOperationsInput | string
    providerId?: StringFieldUpdateOperationsInput | string
    providerApiKey?: NullableStringFieldUpdateOperationsInput | string | null
    providerApiSecret?: NullableStringFieldUpdateOperationsInput | string | null
    providerUrl?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    client?: ClientUpdateOneRequiredWithoutInvertersNestedInput
    generationUnits?: GenerationUnitUpdateManyWithoutInverterNestedInput
  }

  export type InverterUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    provider?: StringFieldUpdateOperationsInput | string
    providerId?: StringFieldUpdateOperationsInput | string
    providerApiKey?: NullableStringFieldUpdateOperationsInput | string | null
    providerApiSecret?: NullableStringFieldUpdateOperationsInput | string | null
    providerUrl?: NullableStringFieldUpdateOperationsInput | string | null
    clientId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    generationUnits?: GenerationUnitUncheckedUpdateManyWithoutInverterNestedInput
  }

  export type InverterCreateManyInput = {
    id?: string
    provider: string
    providerId: string
    providerApiKey?: string | null
    providerApiSecret?: string | null
    providerUrl?: string | null
    clientId: string
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
  }

  export type InverterUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    provider?: StringFieldUpdateOperationsInput | string
    providerId?: StringFieldUpdateOperationsInput | string
    providerApiKey?: NullableStringFieldUpdateOperationsInput | string | null
    providerApiSecret?: NullableStringFieldUpdateOperationsInput | string | null
    providerUrl?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type InverterUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    provider?: StringFieldUpdateOperationsInput | string
    providerId?: StringFieldUpdateOperationsInput | string
    providerApiKey?: NullableStringFieldUpdateOperationsInput | string | null
    providerApiSecret?: NullableStringFieldUpdateOperationsInput | string | null
    providerUrl?: NullableStringFieldUpdateOperationsInput | string | null
    clientId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type GenerationUnitCreateInput = {
    id?: string
    power: number
    energy: number
    generationUnitType?: string
    timestamp?: Date | string
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    inverter: InverterCreateNestedOneWithoutGenerationUnitsInput
  }

  export type GenerationUnitUncheckedCreateInput = {
    id?: string
    power: number
    energy: number
    generationUnitType?: string
    timestamp?: Date | string
    inverterId: string
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
  }

  export type GenerationUnitUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    power?: FloatFieldUpdateOperationsInput | number
    energy?: FloatFieldUpdateOperationsInput | number
    generationUnitType?: StringFieldUpdateOperationsInput | string
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    inverter?: InverterUpdateOneRequiredWithoutGenerationUnitsNestedInput
  }

  export type GenerationUnitUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    power?: FloatFieldUpdateOperationsInput | number
    energy?: FloatFieldUpdateOperationsInput | number
    generationUnitType?: StringFieldUpdateOperationsInput | string
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    inverterId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type GenerationUnitCreateManyInput = {
    id?: string
    power: number
    energy: number
    generationUnitType?: string
    timestamp?: Date | string
    inverterId: string
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
  }

  export type GenerationUnitUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    power?: FloatFieldUpdateOperationsInput | number
    energy?: FloatFieldUpdateOperationsInput | number
    generationUnitType?: StringFieldUpdateOperationsInput | string
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type GenerationUnitUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    power?: FloatFieldUpdateOperationsInput | number
    energy?: FloatFieldUpdateOperationsInput | number
    generationUnitType?: StringFieldUpdateOperationsInput | string
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    inverterId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type IndicationCreateInput = {
    id?: string
    status?: $Enums.IndicationStatus
    createdAt?: Date | string
    updatedAt?: Date | string
    referrer: ClientCreateNestedOneWithoutIndicationsAsReferrerInput
    referred: ClientCreateNestedOneWithoutIndicationsAsReferredInput
  }

  export type IndicationUncheckedCreateInput = {
    id?: string
    referrerId: string
    referredId: string
    status?: $Enums.IndicationStatus
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type IndicationUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    status?: EnumIndicationStatusFieldUpdateOperationsInput | $Enums.IndicationStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    referrer?: ClientUpdateOneRequiredWithoutIndicationsAsReferrerNestedInput
    referred?: ClientUpdateOneRequiredWithoutIndicationsAsReferredNestedInput
  }

  export type IndicationUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    referrerId?: StringFieldUpdateOperationsInput | string
    referredId?: StringFieldUpdateOperationsInput | string
    status?: EnumIndicationStatusFieldUpdateOperationsInput | $Enums.IndicationStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type IndicationCreateManyInput = {
    id?: string
    referrerId: string
    referredId: string
    status?: $Enums.IndicationStatus
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type IndicationUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    status?: EnumIndicationStatusFieldUpdateOperationsInput | $Enums.IndicationStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type IndicationUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    referrerId?: StringFieldUpdateOperationsInput | string
    referredId?: StringFieldUpdateOperationsInput | string
    status?: EnumIndicationStatusFieldUpdateOperationsInput | $Enums.IndicationStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OfferCreateInput = {
    id?: string
    title: string
    description: string
    partner: string
    cost: number
    discount?: string | null
    imageUrl?: string | null
    validFrom?: Date | string | null
    validTo?: Date | string | null
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type OfferUncheckedCreateInput = {
    id?: string
    title: string
    description: string
    partner: string
    cost: number
    discount?: string | null
    imageUrl?: string | null
    validFrom?: Date | string | null
    validTo?: Date | string | null
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type OfferUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    partner?: StringFieldUpdateOperationsInput | string
    cost?: FloatFieldUpdateOperationsInput | number
    discount?: NullableStringFieldUpdateOperationsInput | string | null
    imageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    validFrom?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    validTo?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OfferUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    partner?: StringFieldUpdateOperationsInput | string
    cost?: FloatFieldUpdateOperationsInput | number
    discount?: NullableStringFieldUpdateOperationsInput | string | null
    imageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    validFrom?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    validTo?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OfferCreateManyInput = {
    id?: string
    title: string
    description: string
    partner: string
    cost: number
    discount?: string | null
    imageUrl?: string | null
    validFrom?: Date | string | null
    validTo?: Date | string | null
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type OfferUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    partner?: StringFieldUpdateOperationsInput | string
    cost?: FloatFieldUpdateOperationsInput | number
    discount?: NullableStringFieldUpdateOperationsInput | string | null
    imageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    validFrom?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    validTo?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OfferUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    partner?: StringFieldUpdateOperationsInput | string
    cost?: FloatFieldUpdateOperationsInput | number
    discount?: NullableStringFieldUpdateOperationsInput | string | null
    imageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    validFrom?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    validTo?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FAQCreateInput = {
    id?: string
    question: string
    answer: string
    category?: string | null
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type FAQUncheckedCreateInput = {
    id?: string
    question: string
    answer: string
    category?: string | null
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type FAQUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    question?: StringFieldUpdateOperationsInput | string
    answer?: StringFieldUpdateOperationsInput | string
    category?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FAQUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    question?: StringFieldUpdateOperationsInput | string
    answer?: StringFieldUpdateOperationsInput | string
    category?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FAQCreateManyInput = {
    id?: string
    question: string
    answer: string
    category?: string | null
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type FAQUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    question?: StringFieldUpdateOperationsInput | string
    answer?: StringFieldUpdateOperationsInput | string
    category?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FAQUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    question?: StringFieldUpdateOperationsInput | string
    answer?: StringFieldUpdateOperationsInput | string
    category?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TransactionCreateInput = {
    id?: string
    type: $Enums.TransactionType
    amount: number
    description?: string | null
    offerId?: string | null
    indicationId?: string | null
    createdAt?: Date | string
    client: ClientCreateNestedOneWithoutTransactionsInput
  }

  export type TransactionUncheckedCreateInput = {
    id?: string
    clientId: string
    type: $Enums.TransactionType
    amount: number
    description?: string | null
    offerId?: string | null
    indicationId?: string | null
    createdAt?: Date | string
  }

  export type TransactionUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: EnumTransactionTypeFieldUpdateOperationsInput | $Enums.TransactionType
    amount?: FloatFieldUpdateOperationsInput | number
    description?: NullableStringFieldUpdateOperationsInput | string | null
    offerId?: NullableStringFieldUpdateOperationsInput | string | null
    indicationId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    client?: ClientUpdateOneRequiredWithoutTransactionsNestedInput
  }

  export type TransactionUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    clientId?: StringFieldUpdateOperationsInput | string
    type?: EnumTransactionTypeFieldUpdateOperationsInput | $Enums.TransactionType
    amount?: FloatFieldUpdateOperationsInput | number
    description?: NullableStringFieldUpdateOperationsInput | string | null
    offerId?: NullableStringFieldUpdateOperationsInput | string | null
    indicationId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TransactionCreateManyInput = {
    id?: string
    clientId: string
    type: $Enums.TransactionType
    amount: number
    description?: string | null
    offerId?: string | null
    indicationId?: string | null
    createdAt?: Date | string
  }

  export type TransactionUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: EnumTransactionTypeFieldUpdateOperationsInput | $Enums.TransactionType
    amount?: FloatFieldUpdateOperationsInput | number
    description?: NullableStringFieldUpdateOperationsInput | string | null
    offerId?: NullableStringFieldUpdateOperationsInput | string | null
    indicationId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TransactionUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    clientId?: StringFieldUpdateOperationsInput | string
    type?: EnumTransactionTypeFieldUpdateOperationsInput | $Enums.TransactionType
    amount?: FloatFieldUpdateOperationsInput | number
    description?: NullableStringFieldUpdateOperationsInput | string | null
    offerId?: NullableStringFieldUpdateOperationsInput | string | null
    indicationId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type StringNullableListFilter<$PrismaModel = never> = {
    equals?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    has?: string | StringFieldRefInput<$PrismaModel> | null
    hasEvery?: string[] | ListStringFieldRefInput<$PrismaModel>
    hasSome?: string[] | ListStringFieldRefInput<$PrismaModel>
    isEmpty?: boolean
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type ClientNullableScalarRelationFilter = {
    is?: ClientWhereInput | null
    isNot?: ClientWhereInput | null
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type UserCountOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    name?: SortOrder
    password?: SortOrder
    roles?: SortOrder
    permissions?: SortOrder
    clientId?: SortOrder
    isActive?: SortOrder
    resetPasswordToken?: SortOrder
    resetPasswordExpires?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserMaxOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    name?: SortOrder
    password?: SortOrder
    clientId?: SortOrder
    isActive?: SortOrder
    resetPasswordToken?: SortOrder
    resetPasswordExpires?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserMinOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    name?: SortOrder
    password?: SortOrder
    clientId?: SortOrder
    isActive?: SortOrder
    resetPasswordToken?: SortOrder
    resetPasswordExpires?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type FloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type FloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type EnumClientStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.ClientStatus | EnumClientStatusFieldRefInput<$PrismaModel>
    in?: $Enums.ClientStatus[] | ListEnumClientStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.ClientStatus[] | ListEnumClientStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumClientStatusFilter<$PrismaModel> | $Enums.ClientStatus
  }

  export type InverterListRelationFilter = {
    every?: InverterWhereInput
    some?: InverterWhereInput
    none?: InverterWhereInput
  }

  export type UserListRelationFilter = {
    every?: UserWhereInput
    some?: UserWhereInput
    none?: UserWhereInput
  }

  export type IndicationListRelationFilter = {
    every?: IndicationWhereInput
    some?: IndicationWhereInput
    none?: IndicationWhereInput
  }

  export type TransactionListRelationFilter = {
    every?: TransactionWhereInput
    some?: TransactionWhereInput
    none?: TransactionWhereInput
  }

  export type InverterOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type UserOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type IndicationOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type TransactionOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type ClientCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    email?: SortOrder
    cpfCnpj?: SortOrder
    phone?: SortOrder
    address?: SortOrder
    avgEnergyCost?: SortOrder
    enelInvoiceFile?: SortOrder
    soloCoinBalance?: SortOrder
    indicationCode?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    deletedAt?: SortOrder
  }

  export type ClientAvgOrderByAggregateInput = {
    avgEnergyCost?: SortOrder
    soloCoinBalance?: SortOrder
  }

  export type ClientMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    email?: SortOrder
    cpfCnpj?: SortOrder
    phone?: SortOrder
    address?: SortOrder
    avgEnergyCost?: SortOrder
    enelInvoiceFile?: SortOrder
    soloCoinBalance?: SortOrder
    indicationCode?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    deletedAt?: SortOrder
  }

  export type ClientMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    email?: SortOrder
    cpfCnpj?: SortOrder
    phone?: SortOrder
    address?: SortOrder
    avgEnergyCost?: SortOrder
    enelInvoiceFile?: SortOrder
    soloCoinBalance?: SortOrder
    indicationCode?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    deletedAt?: SortOrder
  }

  export type ClientSumOrderByAggregateInput = {
    avgEnergyCost?: SortOrder
    soloCoinBalance?: SortOrder
  }

  export type FloatNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedFloatNullableFilter<$PrismaModel>
    _min?: NestedFloatNullableFilter<$PrismaModel>
    _max?: NestedFloatNullableFilter<$PrismaModel>
  }

  export type FloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
  }

  export type EnumClientStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ClientStatus | EnumClientStatusFieldRefInput<$PrismaModel>
    in?: $Enums.ClientStatus[] | ListEnumClientStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.ClientStatus[] | ListEnumClientStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumClientStatusWithAggregatesFilter<$PrismaModel> | $Enums.ClientStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumClientStatusFilter<$PrismaModel>
    _max?: NestedEnumClientStatusFilter<$PrismaModel>
  }

  export type ClientScalarRelationFilter = {
    is?: ClientWhereInput
    isNot?: ClientWhereInput
  }

  export type GenerationUnitListRelationFilter = {
    every?: GenerationUnitWhereInput
    some?: GenerationUnitWhereInput
    none?: GenerationUnitWhereInput
  }

  export type GenerationUnitOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type InverterCountOrderByAggregateInput = {
    id?: SortOrder
    provider?: SortOrder
    providerId?: SortOrder
    providerApiKey?: SortOrder
    providerApiSecret?: SortOrder
    providerUrl?: SortOrder
    clientId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    deletedAt?: SortOrder
  }

  export type InverterMaxOrderByAggregateInput = {
    id?: SortOrder
    provider?: SortOrder
    providerId?: SortOrder
    providerApiKey?: SortOrder
    providerApiSecret?: SortOrder
    providerUrl?: SortOrder
    clientId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    deletedAt?: SortOrder
  }

  export type InverterMinOrderByAggregateInput = {
    id?: SortOrder
    provider?: SortOrder
    providerId?: SortOrder
    providerApiKey?: SortOrder
    providerApiSecret?: SortOrder
    providerUrl?: SortOrder
    clientId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    deletedAt?: SortOrder
  }

  export type InverterScalarRelationFilter = {
    is?: InverterWhereInput
    isNot?: InverterWhereInput
  }

  export type GenerationUnitCountOrderByAggregateInput = {
    id?: SortOrder
    power?: SortOrder
    energy?: SortOrder
    generationUnitType?: SortOrder
    timestamp?: SortOrder
    inverterId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    deletedAt?: SortOrder
  }

  export type GenerationUnitAvgOrderByAggregateInput = {
    power?: SortOrder
    energy?: SortOrder
  }

  export type GenerationUnitMaxOrderByAggregateInput = {
    id?: SortOrder
    power?: SortOrder
    energy?: SortOrder
    generationUnitType?: SortOrder
    timestamp?: SortOrder
    inverterId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    deletedAt?: SortOrder
  }

  export type GenerationUnitMinOrderByAggregateInput = {
    id?: SortOrder
    power?: SortOrder
    energy?: SortOrder
    generationUnitType?: SortOrder
    timestamp?: SortOrder
    inverterId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    deletedAt?: SortOrder
  }

  export type GenerationUnitSumOrderByAggregateInput = {
    power?: SortOrder
    energy?: SortOrder
  }

  export type EnumIndicationStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.IndicationStatus | EnumIndicationStatusFieldRefInput<$PrismaModel>
    in?: $Enums.IndicationStatus[] | ListEnumIndicationStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.IndicationStatus[] | ListEnumIndicationStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumIndicationStatusFilter<$PrismaModel> | $Enums.IndicationStatus
  }

  export type IndicationCountOrderByAggregateInput = {
    id?: SortOrder
    referrerId?: SortOrder
    referredId?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type IndicationMaxOrderByAggregateInput = {
    id?: SortOrder
    referrerId?: SortOrder
    referredId?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type IndicationMinOrderByAggregateInput = {
    id?: SortOrder
    referrerId?: SortOrder
    referredId?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type EnumIndicationStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.IndicationStatus | EnumIndicationStatusFieldRefInput<$PrismaModel>
    in?: $Enums.IndicationStatus[] | ListEnumIndicationStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.IndicationStatus[] | ListEnumIndicationStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumIndicationStatusWithAggregatesFilter<$PrismaModel> | $Enums.IndicationStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumIndicationStatusFilter<$PrismaModel>
    _max?: NestedEnumIndicationStatusFilter<$PrismaModel>
  }

  export type OfferCountOrderByAggregateInput = {
    id?: SortOrder
    title?: SortOrder
    description?: SortOrder
    partner?: SortOrder
    cost?: SortOrder
    discount?: SortOrder
    imageUrl?: SortOrder
    validFrom?: SortOrder
    validTo?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type OfferAvgOrderByAggregateInput = {
    cost?: SortOrder
  }

  export type OfferMaxOrderByAggregateInput = {
    id?: SortOrder
    title?: SortOrder
    description?: SortOrder
    partner?: SortOrder
    cost?: SortOrder
    discount?: SortOrder
    imageUrl?: SortOrder
    validFrom?: SortOrder
    validTo?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type OfferMinOrderByAggregateInput = {
    id?: SortOrder
    title?: SortOrder
    description?: SortOrder
    partner?: SortOrder
    cost?: SortOrder
    discount?: SortOrder
    imageUrl?: SortOrder
    validFrom?: SortOrder
    validTo?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type OfferSumOrderByAggregateInput = {
    cost?: SortOrder
  }

  export type FAQCountOrderByAggregateInput = {
    id?: SortOrder
    question?: SortOrder
    answer?: SortOrder
    category?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type FAQMaxOrderByAggregateInput = {
    id?: SortOrder
    question?: SortOrder
    answer?: SortOrder
    category?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type FAQMinOrderByAggregateInput = {
    id?: SortOrder
    question?: SortOrder
    answer?: SortOrder
    category?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type EnumTransactionTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.TransactionType | EnumTransactionTypeFieldRefInput<$PrismaModel>
    in?: $Enums.TransactionType[] | ListEnumTransactionTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.TransactionType[] | ListEnumTransactionTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumTransactionTypeFilter<$PrismaModel> | $Enums.TransactionType
  }

  export type TransactionCountOrderByAggregateInput = {
    id?: SortOrder
    clientId?: SortOrder
    type?: SortOrder
    amount?: SortOrder
    description?: SortOrder
    offerId?: SortOrder
    indicationId?: SortOrder
    createdAt?: SortOrder
  }

  export type TransactionAvgOrderByAggregateInput = {
    amount?: SortOrder
  }

  export type TransactionMaxOrderByAggregateInput = {
    id?: SortOrder
    clientId?: SortOrder
    type?: SortOrder
    amount?: SortOrder
    description?: SortOrder
    offerId?: SortOrder
    indicationId?: SortOrder
    createdAt?: SortOrder
  }

  export type TransactionMinOrderByAggregateInput = {
    id?: SortOrder
    clientId?: SortOrder
    type?: SortOrder
    amount?: SortOrder
    description?: SortOrder
    offerId?: SortOrder
    indicationId?: SortOrder
    createdAt?: SortOrder
  }

  export type TransactionSumOrderByAggregateInput = {
    amount?: SortOrder
  }

  export type EnumTransactionTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.TransactionType | EnumTransactionTypeFieldRefInput<$PrismaModel>
    in?: $Enums.TransactionType[] | ListEnumTransactionTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.TransactionType[] | ListEnumTransactionTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumTransactionTypeWithAggregatesFilter<$PrismaModel> | $Enums.TransactionType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumTransactionTypeFilter<$PrismaModel>
    _max?: NestedEnumTransactionTypeFilter<$PrismaModel>
  }

  export type UserCreaterolesInput = {
    set: string[]
  }

  export type UserCreatepermissionsInput = {
    set: string[]
  }

  export type ClientCreateNestedOneWithoutUsersInput = {
    create?: XOR<ClientCreateWithoutUsersInput, ClientUncheckedCreateWithoutUsersInput>
    connectOrCreate?: ClientCreateOrConnectWithoutUsersInput
    connect?: ClientWhereUniqueInput
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type UserUpdaterolesInput = {
    set?: string[]
    push?: string | string[]
  }

  export type UserUpdatepermissionsInput = {
    set?: string[]
    push?: string | string[]
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type ClientUpdateOneWithoutUsersNestedInput = {
    create?: XOR<ClientCreateWithoutUsersInput, ClientUncheckedCreateWithoutUsersInput>
    connectOrCreate?: ClientCreateOrConnectWithoutUsersInput
    upsert?: ClientUpsertWithoutUsersInput
    disconnect?: ClientWhereInput | boolean
    delete?: ClientWhereInput | boolean
    connect?: ClientWhereUniqueInput
    update?: XOR<XOR<ClientUpdateToOneWithWhereWithoutUsersInput, ClientUpdateWithoutUsersInput>, ClientUncheckedUpdateWithoutUsersInput>
  }

  export type InverterCreateNestedManyWithoutClientInput = {
    create?: XOR<InverterCreateWithoutClientInput, InverterUncheckedCreateWithoutClientInput> | InverterCreateWithoutClientInput[] | InverterUncheckedCreateWithoutClientInput[]
    connectOrCreate?: InverterCreateOrConnectWithoutClientInput | InverterCreateOrConnectWithoutClientInput[]
    createMany?: InverterCreateManyClientInputEnvelope
    connect?: InverterWhereUniqueInput | InverterWhereUniqueInput[]
  }

  export type UserCreateNestedManyWithoutClientInput = {
    create?: XOR<UserCreateWithoutClientInput, UserUncheckedCreateWithoutClientInput> | UserCreateWithoutClientInput[] | UserUncheckedCreateWithoutClientInput[]
    connectOrCreate?: UserCreateOrConnectWithoutClientInput | UserCreateOrConnectWithoutClientInput[]
    createMany?: UserCreateManyClientInputEnvelope
    connect?: UserWhereUniqueInput | UserWhereUniqueInput[]
  }

  export type IndicationCreateNestedManyWithoutReferrerInput = {
    create?: XOR<IndicationCreateWithoutReferrerInput, IndicationUncheckedCreateWithoutReferrerInput> | IndicationCreateWithoutReferrerInput[] | IndicationUncheckedCreateWithoutReferrerInput[]
    connectOrCreate?: IndicationCreateOrConnectWithoutReferrerInput | IndicationCreateOrConnectWithoutReferrerInput[]
    createMany?: IndicationCreateManyReferrerInputEnvelope
    connect?: IndicationWhereUniqueInput | IndicationWhereUniqueInput[]
  }

  export type IndicationCreateNestedManyWithoutReferredInput = {
    create?: XOR<IndicationCreateWithoutReferredInput, IndicationUncheckedCreateWithoutReferredInput> | IndicationCreateWithoutReferredInput[] | IndicationUncheckedCreateWithoutReferredInput[]
    connectOrCreate?: IndicationCreateOrConnectWithoutReferredInput | IndicationCreateOrConnectWithoutReferredInput[]
    createMany?: IndicationCreateManyReferredInputEnvelope
    connect?: IndicationWhereUniqueInput | IndicationWhereUniqueInput[]
  }

  export type TransactionCreateNestedManyWithoutClientInput = {
    create?: XOR<TransactionCreateWithoutClientInput, TransactionUncheckedCreateWithoutClientInput> | TransactionCreateWithoutClientInput[] | TransactionUncheckedCreateWithoutClientInput[]
    connectOrCreate?: TransactionCreateOrConnectWithoutClientInput | TransactionCreateOrConnectWithoutClientInput[]
    createMany?: TransactionCreateManyClientInputEnvelope
    connect?: TransactionWhereUniqueInput | TransactionWhereUniqueInput[]
  }

  export type InverterUncheckedCreateNestedManyWithoutClientInput = {
    create?: XOR<InverterCreateWithoutClientInput, InverterUncheckedCreateWithoutClientInput> | InverterCreateWithoutClientInput[] | InverterUncheckedCreateWithoutClientInput[]
    connectOrCreate?: InverterCreateOrConnectWithoutClientInput | InverterCreateOrConnectWithoutClientInput[]
    createMany?: InverterCreateManyClientInputEnvelope
    connect?: InverterWhereUniqueInput | InverterWhereUniqueInput[]
  }

  export type UserUncheckedCreateNestedManyWithoutClientInput = {
    create?: XOR<UserCreateWithoutClientInput, UserUncheckedCreateWithoutClientInput> | UserCreateWithoutClientInput[] | UserUncheckedCreateWithoutClientInput[]
    connectOrCreate?: UserCreateOrConnectWithoutClientInput | UserCreateOrConnectWithoutClientInput[]
    createMany?: UserCreateManyClientInputEnvelope
    connect?: UserWhereUniqueInput | UserWhereUniqueInput[]
  }

  export type IndicationUncheckedCreateNestedManyWithoutReferrerInput = {
    create?: XOR<IndicationCreateWithoutReferrerInput, IndicationUncheckedCreateWithoutReferrerInput> | IndicationCreateWithoutReferrerInput[] | IndicationUncheckedCreateWithoutReferrerInput[]
    connectOrCreate?: IndicationCreateOrConnectWithoutReferrerInput | IndicationCreateOrConnectWithoutReferrerInput[]
    createMany?: IndicationCreateManyReferrerInputEnvelope
    connect?: IndicationWhereUniqueInput | IndicationWhereUniqueInput[]
  }

  export type IndicationUncheckedCreateNestedManyWithoutReferredInput = {
    create?: XOR<IndicationCreateWithoutReferredInput, IndicationUncheckedCreateWithoutReferredInput> | IndicationCreateWithoutReferredInput[] | IndicationUncheckedCreateWithoutReferredInput[]
    connectOrCreate?: IndicationCreateOrConnectWithoutReferredInput | IndicationCreateOrConnectWithoutReferredInput[]
    createMany?: IndicationCreateManyReferredInputEnvelope
    connect?: IndicationWhereUniqueInput | IndicationWhereUniqueInput[]
  }

  export type TransactionUncheckedCreateNestedManyWithoutClientInput = {
    create?: XOR<TransactionCreateWithoutClientInput, TransactionUncheckedCreateWithoutClientInput> | TransactionCreateWithoutClientInput[] | TransactionUncheckedCreateWithoutClientInput[]
    connectOrCreate?: TransactionCreateOrConnectWithoutClientInput | TransactionCreateOrConnectWithoutClientInput[]
    createMany?: TransactionCreateManyClientInputEnvelope
    connect?: TransactionWhereUniqueInput | TransactionWhereUniqueInput[]
  }

  export type NullableFloatFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type FloatFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type EnumClientStatusFieldUpdateOperationsInput = {
    set?: $Enums.ClientStatus
  }

  export type InverterUpdateManyWithoutClientNestedInput = {
    create?: XOR<InverterCreateWithoutClientInput, InverterUncheckedCreateWithoutClientInput> | InverterCreateWithoutClientInput[] | InverterUncheckedCreateWithoutClientInput[]
    connectOrCreate?: InverterCreateOrConnectWithoutClientInput | InverterCreateOrConnectWithoutClientInput[]
    upsert?: InverterUpsertWithWhereUniqueWithoutClientInput | InverterUpsertWithWhereUniqueWithoutClientInput[]
    createMany?: InverterCreateManyClientInputEnvelope
    set?: InverterWhereUniqueInput | InverterWhereUniqueInput[]
    disconnect?: InverterWhereUniqueInput | InverterWhereUniqueInput[]
    delete?: InverterWhereUniqueInput | InverterWhereUniqueInput[]
    connect?: InverterWhereUniqueInput | InverterWhereUniqueInput[]
    update?: InverterUpdateWithWhereUniqueWithoutClientInput | InverterUpdateWithWhereUniqueWithoutClientInput[]
    updateMany?: InverterUpdateManyWithWhereWithoutClientInput | InverterUpdateManyWithWhereWithoutClientInput[]
    deleteMany?: InverterScalarWhereInput | InverterScalarWhereInput[]
  }

  export type UserUpdateManyWithoutClientNestedInput = {
    create?: XOR<UserCreateWithoutClientInput, UserUncheckedCreateWithoutClientInput> | UserCreateWithoutClientInput[] | UserUncheckedCreateWithoutClientInput[]
    connectOrCreate?: UserCreateOrConnectWithoutClientInput | UserCreateOrConnectWithoutClientInput[]
    upsert?: UserUpsertWithWhereUniqueWithoutClientInput | UserUpsertWithWhereUniqueWithoutClientInput[]
    createMany?: UserCreateManyClientInputEnvelope
    set?: UserWhereUniqueInput | UserWhereUniqueInput[]
    disconnect?: UserWhereUniqueInput | UserWhereUniqueInput[]
    delete?: UserWhereUniqueInput | UserWhereUniqueInput[]
    connect?: UserWhereUniqueInput | UserWhereUniqueInput[]
    update?: UserUpdateWithWhereUniqueWithoutClientInput | UserUpdateWithWhereUniqueWithoutClientInput[]
    updateMany?: UserUpdateManyWithWhereWithoutClientInput | UserUpdateManyWithWhereWithoutClientInput[]
    deleteMany?: UserScalarWhereInput | UserScalarWhereInput[]
  }

  export type IndicationUpdateManyWithoutReferrerNestedInput = {
    create?: XOR<IndicationCreateWithoutReferrerInput, IndicationUncheckedCreateWithoutReferrerInput> | IndicationCreateWithoutReferrerInput[] | IndicationUncheckedCreateWithoutReferrerInput[]
    connectOrCreate?: IndicationCreateOrConnectWithoutReferrerInput | IndicationCreateOrConnectWithoutReferrerInput[]
    upsert?: IndicationUpsertWithWhereUniqueWithoutReferrerInput | IndicationUpsertWithWhereUniqueWithoutReferrerInput[]
    createMany?: IndicationCreateManyReferrerInputEnvelope
    set?: IndicationWhereUniqueInput | IndicationWhereUniqueInput[]
    disconnect?: IndicationWhereUniqueInput | IndicationWhereUniqueInput[]
    delete?: IndicationWhereUniqueInput | IndicationWhereUniqueInput[]
    connect?: IndicationWhereUniqueInput | IndicationWhereUniqueInput[]
    update?: IndicationUpdateWithWhereUniqueWithoutReferrerInput | IndicationUpdateWithWhereUniqueWithoutReferrerInput[]
    updateMany?: IndicationUpdateManyWithWhereWithoutReferrerInput | IndicationUpdateManyWithWhereWithoutReferrerInput[]
    deleteMany?: IndicationScalarWhereInput | IndicationScalarWhereInput[]
  }

  export type IndicationUpdateManyWithoutReferredNestedInput = {
    create?: XOR<IndicationCreateWithoutReferredInput, IndicationUncheckedCreateWithoutReferredInput> | IndicationCreateWithoutReferredInput[] | IndicationUncheckedCreateWithoutReferredInput[]
    connectOrCreate?: IndicationCreateOrConnectWithoutReferredInput | IndicationCreateOrConnectWithoutReferredInput[]
    upsert?: IndicationUpsertWithWhereUniqueWithoutReferredInput | IndicationUpsertWithWhereUniqueWithoutReferredInput[]
    createMany?: IndicationCreateManyReferredInputEnvelope
    set?: IndicationWhereUniqueInput | IndicationWhereUniqueInput[]
    disconnect?: IndicationWhereUniqueInput | IndicationWhereUniqueInput[]
    delete?: IndicationWhereUniqueInput | IndicationWhereUniqueInput[]
    connect?: IndicationWhereUniqueInput | IndicationWhereUniqueInput[]
    update?: IndicationUpdateWithWhereUniqueWithoutReferredInput | IndicationUpdateWithWhereUniqueWithoutReferredInput[]
    updateMany?: IndicationUpdateManyWithWhereWithoutReferredInput | IndicationUpdateManyWithWhereWithoutReferredInput[]
    deleteMany?: IndicationScalarWhereInput | IndicationScalarWhereInput[]
  }

  export type TransactionUpdateManyWithoutClientNestedInput = {
    create?: XOR<TransactionCreateWithoutClientInput, TransactionUncheckedCreateWithoutClientInput> | TransactionCreateWithoutClientInput[] | TransactionUncheckedCreateWithoutClientInput[]
    connectOrCreate?: TransactionCreateOrConnectWithoutClientInput | TransactionCreateOrConnectWithoutClientInput[]
    upsert?: TransactionUpsertWithWhereUniqueWithoutClientInput | TransactionUpsertWithWhereUniqueWithoutClientInput[]
    createMany?: TransactionCreateManyClientInputEnvelope
    set?: TransactionWhereUniqueInput | TransactionWhereUniqueInput[]
    disconnect?: TransactionWhereUniqueInput | TransactionWhereUniqueInput[]
    delete?: TransactionWhereUniqueInput | TransactionWhereUniqueInput[]
    connect?: TransactionWhereUniqueInput | TransactionWhereUniqueInput[]
    update?: TransactionUpdateWithWhereUniqueWithoutClientInput | TransactionUpdateWithWhereUniqueWithoutClientInput[]
    updateMany?: TransactionUpdateManyWithWhereWithoutClientInput | TransactionUpdateManyWithWhereWithoutClientInput[]
    deleteMany?: TransactionScalarWhereInput | TransactionScalarWhereInput[]
  }

  export type InverterUncheckedUpdateManyWithoutClientNestedInput = {
    create?: XOR<InverterCreateWithoutClientInput, InverterUncheckedCreateWithoutClientInput> | InverterCreateWithoutClientInput[] | InverterUncheckedCreateWithoutClientInput[]
    connectOrCreate?: InverterCreateOrConnectWithoutClientInput | InverterCreateOrConnectWithoutClientInput[]
    upsert?: InverterUpsertWithWhereUniqueWithoutClientInput | InverterUpsertWithWhereUniqueWithoutClientInput[]
    createMany?: InverterCreateManyClientInputEnvelope
    set?: InverterWhereUniqueInput | InverterWhereUniqueInput[]
    disconnect?: InverterWhereUniqueInput | InverterWhereUniqueInput[]
    delete?: InverterWhereUniqueInput | InverterWhereUniqueInput[]
    connect?: InverterWhereUniqueInput | InverterWhereUniqueInput[]
    update?: InverterUpdateWithWhereUniqueWithoutClientInput | InverterUpdateWithWhereUniqueWithoutClientInput[]
    updateMany?: InverterUpdateManyWithWhereWithoutClientInput | InverterUpdateManyWithWhereWithoutClientInput[]
    deleteMany?: InverterScalarWhereInput | InverterScalarWhereInput[]
  }

  export type UserUncheckedUpdateManyWithoutClientNestedInput = {
    create?: XOR<UserCreateWithoutClientInput, UserUncheckedCreateWithoutClientInput> | UserCreateWithoutClientInput[] | UserUncheckedCreateWithoutClientInput[]
    connectOrCreate?: UserCreateOrConnectWithoutClientInput | UserCreateOrConnectWithoutClientInput[]
    upsert?: UserUpsertWithWhereUniqueWithoutClientInput | UserUpsertWithWhereUniqueWithoutClientInput[]
    createMany?: UserCreateManyClientInputEnvelope
    set?: UserWhereUniqueInput | UserWhereUniqueInput[]
    disconnect?: UserWhereUniqueInput | UserWhereUniqueInput[]
    delete?: UserWhereUniqueInput | UserWhereUniqueInput[]
    connect?: UserWhereUniqueInput | UserWhereUniqueInput[]
    update?: UserUpdateWithWhereUniqueWithoutClientInput | UserUpdateWithWhereUniqueWithoutClientInput[]
    updateMany?: UserUpdateManyWithWhereWithoutClientInput | UserUpdateManyWithWhereWithoutClientInput[]
    deleteMany?: UserScalarWhereInput | UserScalarWhereInput[]
  }

  export type IndicationUncheckedUpdateManyWithoutReferrerNestedInput = {
    create?: XOR<IndicationCreateWithoutReferrerInput, IndicationUncheckedCreateWithoutReferrerInput> | IndicationCreateWithoutReferrerInput[] | IndicationUncheckedCreateWithoutReferrerInput[]
    connectOrCreate?: IndicationCreateOrConnectWithoutReferrerInput | IndicationCreateOrConnectWithoutReferrerInput[]
    upsert?: IndicationUpsertWithWhereUniqueWithoutReferrerInput | IndicationUpsertWithWhereUniqueWithoutReferrerInput[]
    createMany?: IndicationCreateManyReferrerInputEnvelope
    set?: IndicationWhereUniqueInput | IndicationWhereUniqueInput[]
    disconnect?: IndicationWhereUniqueInput | IndicationWhereUniqueInput[]
    delete?: IndicationWhereUniqueInput | IndicationWhereUniqueInput[]
    connect?: IndicationWhereUniqueInput | IndicationWhereUniqueInput[]
    update?: IndicationUpdateWithWhereUniqueWithoutReferrerInput | IndicationUpdateWithWhereUniqueWithoutReferrerInput[]
    updateMany?: IndicationUpdateManyWithWhereWithoutReferrerInput | IndicationUpdateManyWithWhereWithoutReferrerInput[]
    deleteMany?: IndicationScalarWhereInput | IndicationScalarWhereInput[]
  }

  export type IndicationUncheckedUpdateManyWithoutReferredNestedInput = {
    create?: XOR<IndicationCreateWithoutReferredInput, IndicationUncheckedCreateWithoutReferredInput> | IndicationCreateWithoutReferredInput[] | IndicationUncheckedCreateWithoutReferredInput[]
    connectOrCreate?: IndicationCreateOrConnectWithoutReferredInput | IndicationCreateOrConnectWithoutReferredInput[]
    upsert?: IndicationUpsertWithWhereUniqueWithoutReferredInput | IndicationUpsertWithWhereUniqueWithoutReferredInput[]
    createMany?: IndicationCreateManyReferredInputEnvelope
    set?: IndicationWhereUniqueInput | IndicationWhereUniqueInput[]
    disconnect?: IndicationWhereUniqueInput | IndicationWhereUniqueInput[]
    delete?: IndicationWhereUniqueInput | IndicationWhereUniqueInput[]
    connect?: IndicationWhereUniqueInput | IndicationWhereUniqueInput[]
    update?: IndicationUpdateWithWhereUniqueWithoutReferredInput | IndicationUpdateWithWhereUniqueWithoutReferredInput[]
    updateMany?: IndicationUpdateManyWithWhereWithoutReferredInput | IndicationUpdateManyWithWhereWithoutReferredInput[]
    deleteMany?: IndicationScalarWhereInput | IndicationScalarWhereInput[]
  }

  export type TransactionUncheckedUpdateManyWithoutClientNestedInput = {
    create?: XOR<TransactionCreateWithoutClientInput, TransactionUncheckedCreateWithoutClientInput> | TransactionCreateWithoutClientInput[] | TransactionUncheckedCreateWithoutClientInput[]
    connectOrCreate?: TransactionCreateOrConnectWithoutClientInput | TransactionCreateOrConnectWithoutClientInput[]
    upsert?: TransactionUpsertWithWhereUniqueWithoutClientInput | TransactionUpsertWithWhereUniqueWithoutClientInput[]
    createMany?: TransactionCreateManyClientInputEnvelope
    set?: TransactionWhereUniqueInput | TransactionWhereUniqueInput[]
    disconnect?: TransactionWhereUniqueInput | TransactionWhereUniqueInput[]
    delete?: TransactionWhereUniqueInput | TransactionWhereUniqueInput[]
    connect?: TransactionWhereUniqueInput | TransactionWhereUniqueInput[]
    update?: TransactionUpdateWithWhereUniqueWithoutClientInput | TransactionUpdateWithWhereUniqueWithoutClientInput[]
    updateMany?: TransactionUpdateManyWithWhereWithoutClientInput | TransactionUpdateManyWithWhereWithoutClientInput[]
    deleteMany?: TransactionScalarWhereInput | TransactionScalarWhereInput[]
  }

  export type ClientCreateNestedOneWithoutInvertersInput = {
    create?: XOR<ClientCreateWithoutInvertersInput, ClientUncheckedCreateWithoutInvertersInput>
    connectOrCreate?: ClientCreateOrConnectWithoutInvertersInput
    connect?: ClientWhereUniqueInput
  }

  export type GenerationUnitCreateNestedManyWithoutInverterInput = {
    create?: XOR<GenerationUnitCreateWithoutInverterInput, GenerationUnitUncheckedCreateWithoutInverterInput> | GenerationUnitCreateWithoutInverterInput[] | GenerationUnitUncheckedCreateWithoutInverterInput[]
    connectOrCreate?: GenerationUnitCreateOrConnectWithoutInverterInput | GenerationUnitCreateOrConnectWithoutInverterInput[]
    createMany?: GenerationUnitCreateManyInverterInputEnvelope
    connect?: GenerationUnitWhereUniqueInput | GenerationUnitWhereUniqueInput[]
  }

  export type GenerationUnitUncheckedCreateNestedManyWithoutInverterInput = {
    create?: XOR<GenerationUnitCreateWithoutInverterInput, GenerationUnitUncheckedCreateWithoutInverterInput> | GenerationUnitCreateWithoutInverterInput[] | GenerationUnitUncheckedCreateWithoutInverterInput[]
    connectOrCreate?: GenerationUnitCreateOrConnectWithoutInverterInput | GenerationUnitCreateOrConnectWithoutInverterInput[]
    createMany?: GenerationUnitCreateManyInverterInputEnvelope
    connect?: GenerationUnitWhereUniqueInput | GenerationUnitWhereUniqueInput[]
  }

  export type ClientUpdateOneRequiredWithoutInvertersNestedInput = {
    create?: XOR<ClientCreateWithoutInvertersInput, ClientUncheckedCreateWithoutInvertersInput>
    connectOrCreate?: ClientCreateOrConnectWithoutInvertersInput
    upsert?: ClientUpsertWithoutInvertersInput
    connect?: ClientWhereUniqueInput
    update?: XOR<XOR<ClientUpdateToOneWithWhereWithoutInvertersInput, ClientUpdateWithoutInvertersInput>, ClientUncheckedUpdateWithoutInvertersInput>
  }

  export type GenerationUnitUpdateManyWithoutInverterNestedInput = {
    create?: XOR<GenerationUnitCreateWithoutInverterInput, GenerationUnitUncheckedCreateWithoutInverterInput> | GenerationUnitCreateWithoutInverterInput[] | GenerationUnitUncheckedCreateWithoutInverterInput[]
    connectOrCreate?: GenerationUnitCreateOrConnectWithoutInverterInput | GenerationUnitCreateOrConnectWithoutInverterInput[]
    upsert?: GenerationUnitUpsertWithWhereUniqueWithoutInverterInput | GenerationUnitUpsertWithWhereUniqueWithoutInverterInput[]
    createMany?: GenerationUnitCreateManyInverterInputEnvelope
    set?: GenerationUnitWhereUniqueInput | GenerationUnitWhereUniqueInput[]
    disconnect?: GenerationUnitWhereUniqueInput | GenerationUnitWhereUniqueInput[]
    delete?: GenerationUnitWhereUniqueInput | GenerationUnitWhereUniqueInput[]
    connect?: GenerationUnitWhereUniqueInput | GenerationUnitWhereUniqueInput[]
    update?: GenerationUnitUpdateWithWhereUniqueWithoutInverterInput | GenerationUnitUpdateWithWhereUniqueWithoutInverterInput[]
    updateMany?: GenerationUnitUpdateManyWithWhereWithoutInverterInput | GenerationUnitUpdateManyWithWhereWithoutInverterInput[]
    deleteMany?: GenerationUnitScalarWhereInput | GenerationUnitScalarWhereInput[]
  }

  export type GenerationUnitUncheckedUpdateManyWithoutInverterNestedInput = {
    create?: XOR<GenerationUnitCreateWithoutInverterInput, GenerationUnitUncheckedCreateWithoutInverterInput> | GenerationUnitCreateWithoutInverterInput[] | GenerationUnitUncheckedCreateWithoutInverterInput[]
    connectOrCreate?: GenerationUnitCreateOrConnectWithoutInverterInput | GenerationUnitCreateOrConnectWithoutInverterInput[]
    upsert?: GenerationUnitUpsertWithWhereUniqueWithoutInverterInput | GenerationUnitUpsertWithWhereUniqueWithoutInverterInput[]
    createMany?: GenerationUnitCreateManyInverterInputEnvelope
    set?: GenerationUnitWhereUniqueInput | GenerationUnitWhereUniqueInput[]
    disconnect?: GenerationUnitWhereUniqueInput | GenerationUnitWhereUniqueInput[]
    delete?: GenerationUnitWhereUniqueInput | GenerationUnitWhereUniqueInput[]
    connect?: GenerationUnitWhereUniqueInput | GenerationUnitWhereUniqueInput[]
    update?: GenerationUnitUpdateWithWhereUniqueWithoutInverterInput | GenerationUnitUpdateWithWhereUniqueWithoutInverterInput[]
    updateMany?: GenerationUnitUpdateManyWithWhereWithoutInverterInput | GenerationUnitUpdateManyWithWhereWithoutInverterInput[]
    deleteMany?: GenerationUnitScalarWhereInput | GenerationUnitScalarWhereInput[]
  }

  export type InverterCreateNestedOneWithoutGenerationUnitsInput = {
    create?: XOR<InverterCreateWithoutGenerationUnitsInput, InverterUncheckedCreateWithoutGenerationUnitsInput>
    connectOrCreate?: InverterCreateOrConnectWithoutGenerationUnitsInput
    connect?: InverterWhereUniqueInput
  }

  export type InverterUpdateOneRequiredWithoutGenerationUnitsNestedInput = {
    create?: XOR<InverterCreateWithoutGenerationUnitsInput, InverterUncheckedCreateWithoutGenerationUnitsInput>
    connectOrCreate?: InverterCreateOrConnectWithoutGenerationUnitsInput
    upsert?: InverterUpsertWithoutGenerationUnitsInput
    connect?: InverterWhereUniqueInput
    update?: XOR<XOR<InverterUpdateToOneWithWhereWithoutGenerationUnitsInput, InverterUpdateWithoutGenerationUnitsInput>, InverterUncheckedUpdateWithoutGenerationUnitsInput>
  }

  export type ClientCreateNestedOneWithoutIndicationsAsReferrerInput = {
    create?: XOR<ClientCreateWithoutIndicationsAsReferrerInput, ClientUncheckedCreateWithoutIndicationsAsReferrerInput>
    connectOrCreate?: ClientCreateOrConnectWithoutIndicationsAsReferrerInput
    connect?: ClientWhereUniqueInput
  }

  export type ClientCreateNestedOneWithoutIndicationsAsReferredInput = {
    create?: XOR<ClientCreateWithoutIndicationsAsReferredInput, ClientUncheckedCreateWithoutIndicationsAsReferredInput>
    connectOrCreate?: ClientCreateOrConnectWithoutIndicationsAsReferredInput
    connect?: ClientWhereUniqueInput
  }

  export type EnumIndicationStatusFieldUpdateOperationsInput = {
    set?: $Enums.IndicationStatus
  }

  export type ClientUpdateOneRequiredWithoutIndicationsAsReferrerNestedInput = {
    create?: XOR<ClientCreateWithoutIndicationsAsReferrerInput, ClientUncheckedCreateWithoutIndicationsAsReferrerInput>
    connectOrCreate?: ClientCreateOrConnectWithoutIndicationsAsReferrerInput
    upsert?: ClientUpsertWithoutIndicationsAsReferrerInput
    connect?: ClientWhereUniqueInput
    update?: XOR<XOR<ClientUpdateToOneWithWhereWithoutIndicationsAsReferrerInput, ClientUpdateWithoutIndicationsAsReferrerInput>, ClientUncheckedUpdateWithoutIndicationsAsReferrerInput>
  }

  export type ClientUpdateOneRequiredWithoutIndicationsAsReferredNestedInput = {
    create?: XOR<ClientCreateWithoutIndicationsAsReferredInput, ClientUncheckedCreateWithoutIndicationsAsReferredInput>
    connectOrCreate?: ClientCreateOrConnectWithoutIndicationsAsReferredInput
    upsert?: ClientUpsertWithoutIndicationsAsReferredInput
    connect?: ClientWhereUniqueInput
    update?: XOR<XOR<ClientUpdateToOneWithWhereWithoutIndicationsAsReferredInput, ClientUpdateWithoutIndicationsAsReferredInput>, ClientUncheckedUpdateWithoutIndicationsAsReferredInput>
  }

  export type ClientCreateNestedOneWithoutTransactionsInput = {
    create?: XOR<ClientCreateWithoutTransactionsInput, ClientUncheckedCreateWithoutTransactionsInput>
    connectOrCreate?: ClientCreateOrConnectWithoutTransactionsInput
    connect?: ClientWhereUniqueInput
  }

  export type EnumTransactionTypeFieldUpdateOperationsInput = {
    set?: $Enums.TransactionType
  }

  export type ClientUpdateOneRequiredWithoutTransactionsNestedInput = {
    create?: XOR<ClientCreateWithoutTransactionsInput, ClientUncheckedCreateWithoutTransactionsInput>
    connectOrCreate?: ClientCreateOrConnectWithoutTransactionsInput
    upsert?: ClientUpsertWithoutTransactionsInput
    connect?: ClientWhereUniqueInput
    update?: XOR<XOR<ClientUpdateToOneWithWhereWithoutTransactionsInput, ClientUpdateWithoutTransactionsInput>, ClientUncheckedUpdateWithoutTransactionsInput>
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedEnumClientStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.ClientStatus | EnumClientStatusFieldRefInput<$PrismaModel>
    in?: $Enums.ClientStatus[] | ListEnumClientStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.ClientStatus[] | ListEnumClientStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumClientStatusFilter<$PrismaModel> | $Enums.ClientStatus
  }

  export type NestedFloatNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedFloatNullableFilter<$PrismaModel>
    _min?: NestedFloatNullableFilter<$PrismaModel>
    _max?: NestedFloatNullableFilter<$PrismaModel>
  }

  export type NestedFloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
  }

  export type NestedEnumClientStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ClientStatus | EnumClientStatusFieldRefInput<$PrismaModel>
    in?: $Enums.ClientStatus[] | ListEnumClientStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.ClientStatus[] | ListEnumClientStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumClientStatusWithAggregatesFilter<$PrismaModel> | $Enums.ClientStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumClientStatusFilter<$PrismaModel>
    _max?: NestedEnumClientStatusFilter<$PrismaModel>
  }

  export type NestedEnumIndicationStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.IndicationStatus | EnumIndicationStatusFieldRefInput<$PrismaModel>
    in?: $Enums.IndicationStatus[] | ListEnumIndicationStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.IndicationStatus[] | ListEnumIndicationStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumIndicationStatusFilter<$PrismaModel> | $Enums.IndicationStatus
  }

  export type NestedEnumIndicationStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.IndicationStatus | EnumIndicationStatusFieldRefInput<$PrismaModel>
    in?: $Enums.IndicationStatus[] | ListEnumIndicationStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.IndicationStatus[] | ListEnumIndicationStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumIndicationStatusWithAggregatesFilter<$PrismaModel> | $Enums.IndicationStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumIndicationStatusFilter<$PrismaModel>
    _max?: NestedEnumIndicationStatusFilter<$PrismaModel>
  }

  export type NestedEnumTransactionTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.TransactionType | EnumTransactionTypeFieldRefInput<$PrismaModel>
    in?: $Enums.TransactionType[] | ListEnumTransactionTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.TransactionType[] | ListEnumTransactionTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumTransactionTypeFilter<$PrismaModel> | $Enums.TransactionType
  }

  export type NestedEnumTransactionTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.TransactionType | EnumTransactionTypeFieldRefInput<$PrismaModel>
    in?: $Enums.TransactionType[] | ListEnumTransactionTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.TransactionType[] | ListEnumTransactionTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumTransactionTypeWithAggregatesFilter<$PrismaModel> | $Enums.TransactionType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumTransactionTypeFilter<$PrismaModel>
    _max?: NestedEnumTransactionTypeFilter<$PrismaModel>
  }

  export type ClientCreateWithoutUsersInput = {
    id?: string
    name: string
    email: string
    cpfCnpj: string
    phone?: string | null
    address?: string | null
    avgEnergyCost?: number | null
    enelInvoiceFile?: string | null
    soloCoinBalance?: number
    indicationCode: string
    status?: $Enums.ClientStatus
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    inverters?: InverterCreateNestedManyWithoutClientInput
    indicationsAsReferrer?: IndicationCreateNestedManyWithoutReferrerInput
    indicationsAsReferred?: IndicationCreateNestedManyWithoutReferredInput
    transactions?: TransactionCreateNestedManyWithoutClientInput
  }

  export type ClientUncheckedCreateWithoutUsersInput = {
    id?: string
    name: string
    email: string
    cpfCnpj: string
    phone?: string | null
    address?: string | null
    avgEnergyCost?: number | null
    enelInvoiceFile?: string | null
    soloCoinBalance?: number
    indicationCode: string
    status?: $Enums.ClientStatus
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    inverters?: InverterUncheckedCreateNestedManyWithoutClientInput
    indicationsAsReferrer?: IndicationUncheckedCreateNestedManyWithoutReferrerInput
    indicationsAsReferred?: IndicationUncheckedCreateNestedManyWithoutReferredInput
    transactions?: TransactionUncheckedCreateNestedManyWithoutClientInput
  }

  export type ClientCreateOrConnectWithoutUsersInput = {
    where: ClientWhereUniqueInput
    create: XOR<ClientCreateWithoutUsersInput, ClientUncheckedCreateWithoutUsersInput>
  }

  export type ClientUpsertWithoutUsersInput = {
    update: XOR<ClientUpdateWithoutUsersInput, ClientUncheckedUpdateWithoutUsersInput>
    create: XOR<ClientCreateWithoutUsersInput, ClientUncheckedCreateWithoutUsersInput>
    where?: ClientWhereInput
  }

  export type ClientUpdateToOneWithWhereWithoutUsersInput = {
    where?: ClientWhereInput
    data: XOR<ClientUpdateWithoutUsersInput, ClientUncheckedUpdateWithoutUsersInput>
  }

  export type ClientUpdateWithoutUsersInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    cpfCnpj?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    address?: NullableStringFieldUpdateOperationsInput | string | null
    avgEnergyCost?: NullableFloatFieldUpdateOperationsInput | number | null
    enelInvoiceFile?: NullableStringFieldUpdateOperationsInput | string | null
    soloCoinBalance?: FloatFieldUpdateOperationsInput | number
    indicationCode?: StringFieldUpdateOperationsInput | string
    status?: EnumClientStatusFieldUpdateOperationsInput | $Enums.ClientStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    inverters?: InverterUpdateManyWithoutClientNestedInput
    indicationsAsReferrer?: IndicationUpdateManyWithoutReferrerNestedInput
    indicationsAsReferred?: IndicationUpdateManyWithoutReferredNestedInput
    transactions?: TransactionUpdateManyWithoutClientNestedInput
  }

  export type ClientUncheckedUpdateWithoutUsersInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    cpfCnpj?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    address?: NullableStringFieldUpdateOperationsInput | string | null
    avgEnergyCost?: NullableFloatFieldUpdateOperationsInput | number | null
    enelInvoiceFile?: NullableStringFieldUpdateOperationsInput | string | null
    soloCoinBalance?: FloatFieldUpdateOperationsInput | number
    indicationCode?: StringFieldUpdateOperationsInput | string
    status?: EnumClientStatusFieldUpdateOperationsInput | $Enums.ClientStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    inverters?: InverterUncheckedUpdateManyWithoutClientNestedInput
    indicationsAsReferrer?: IndicationUncheckedUpdateManyWithoutReferrerNestedInput
    indicationsAsReferred?: IndicationUncheckedUpdateManyWithoutReferredNestedInput
    transactions?: TransactionUncheckedUpdateManyWithoutClientNestedInput
  }

  export type InverterCreateWithoutClientInput = {
    id?: string
    provider: string
    providerId: string
    providerApiKey?: string | null
    providerApiSecret?: string | null
    providerUrl?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    generationUnits?: GenerationUnitCreateNestedManyWithoutInverterInput
  }

  export type InverterUncheckedCreateWithoutClientInput = {
    id?: string
    provider: string
    providerId: string
    providerApiKey?: string | null
    providerApiSecret?: string | null
    providerUrl?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    generationUnits?: GenerationUnitUncheckedCreateNestedManyWithoutInverterInput
  }

  export type InverterCreateOrConnectWithoutClientInput = {
    where: InverterWhereUniqueInput
    create: XOR<InverterCreateWithoutClientInput, InverterUncheckedCreateWithoutClientInput>
  }

  export type InverterCreateManyClientInputEnvelope = {
    data: InverterCreateManyClientInput | InverterCreateManyClientInput[]
    skipDuplicates?: boolean
  }

  export type UserCreateWithoutClientInput = {
    id?: string
    email: string
    name: string
    password: string
    roles?: UserCreaterolesInput | string[]
    permissions?: UserCreatepermissionsInput | string[]
    isActive?: boolean
    resetPasswordToken?: string | null
    resetPasswordExpires?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserUncheckedCreateWithoutClientInput = {
    id?: string
    email: string
    name: string
    password: string
    roles?: UserCreaterolesInput | string[]
    permissions?: UserCreatepermissionsInput | string[]
    isActive?: boolean
    resetPasswordToken?: string | null
    resetPasswordExpires?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserCreateOrConnectWithoutClientInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutClientInput, UserUncheckedCreateWithoutClientInput>
  }

  export type UserCreateManyClientInputEnvelope = {
    data: UserCreateManyClientInput | UserCreateManyClientInput[]
    skipDuplicates?: boolean
  }

  export type IndicationCreateWithoutReferrerInput = {
    id?: string
    status?: $Enums.IndicationStatus
    createdAt?: Date | string
    updatedAt?: Date | string
    referred: ClientCreateNestedOneWithoutIndicationsAsReferredInput
  }

  export type IndicationUncheckedCreateWithoutReferrerInput = {
    id?: string
    referredId: string
    status?: $Enums.IndicationStatus
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type IndicationCreateOrConnectWithoutReferrerInput = {
    where: IndicationWhereUniqueInput
    create: XOR<IndicationCreateWithoutReferrerInput, IndicationUncheckedCreateWithoutReferrerInput>
  }

  export type IndicationCreateManyReferrerInputEnvelope = {
    data: IndicationCreateManyReferrerInput | IndicationCreateManyReferrerInput[]
    skipDuplicates?: boolean
  }

  export type IndicationCreateWithoutReferredInput = {
    id?: string
    status?: $Enums.IndicationStatus
    createdAt?: Date | string
    updatedAt?: Date | string
    referrer: ClientCreateNestedOneWithoutIndicationsAsReferrerInput
  }

  export type IndicationUncheckedCreateWithoutReferredInput = {
    id?: string
    referrerId: string
    status?: $Enums.IndicationStatus
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type IndicationCreateOrConnectWithoutReferredInput = {
    where: IndicationWhereUniqueInput
    create: XOR<IndicationCreateWithoutReferredInput, IndicationUncheckedCreateWithoutReferredInput>
  }

  export type IndicationCreateManyReferredInputEnvelope = {
    data: IndicationCreateManyReferredInput | IndicationCreateManyReferredInput[]
    skipDuplicates?: boolean
  }

  export type TransactionCreateWithoutClientInput = {
    id?: string
    type: $Enums.TransactionType
    amount: number
    description?: string | null
    offerId?: string | null
    indicationId?: string | null
    createdAt?: Date | string
  }

  export type TransactionUncheckedCreateWithoutClientInput = {
    id?: string
    type: $Enums.TransactionType
    amount: number
    description?: string | null
    offerId?: string | null
    indicationId?: string | null
    createdAt?: Date | string
  }

  export type TransactionCreateOrConnectWithoutClientInput = {
    where: TransactionWhereUniqueInput
    create: XOR<TransactionCreateWithoutClientInput, TransactionUncheckedCreateWithoutClientInput>
  }

  export type TransactionCreateManyClientInputEnvelope = {
    data: TransactionCreateManyClientInput | TransactionCreateManyClientInput[]
    skipDuplicates?: boolean
  }

  export type InverterUpsertWithWhereUniqueWithoutClientInput = {
    where: InverterWhereUniqueInput
    update: XOR<InverterUpdateWithoutClientInput, InverterUncheckedUpdateWithoutClientInput>
    create: XOR<InverterCreateWithoutClientInput, InverterUncheckedCreateWithoutClientInput>
  }

  export type InverterUpdateWithWhereUniqueWithoutClientInput = {
    where: InverterWhereUniqueInput
    data: XOR<InverterUpdateWithoutClientInput, InverterUncheckedUpdateWithoutClientInput>
  }

  export type InverterUpdateManyWithWhereWithoutClientInput = {
    where: InverterScalarWhereInput
    data: XOR<InverterUpdateManyMutationInput, InverterUncheckedUpdateManyWithoutClientInput>
  }

  export type InverterScalarWhereInput = {
    AND?: InverterScalarWhereInput | InverterScalarWhereInput[]
    OR?: InverterScalarWhereInput[]
    NOT?: InverterScalarWhereInput | InverterScalarWhereInput[]
    id?: StringFilter<"Inverter"> | string
    provider?: StringFilter<"Inverter"> | string
    providerId?: StringFilter<"Inverter"> | string
    providerApiKey?: StringNullableFilter<"Inverter"> | string | null
    providerApiSecret?: StringNullableFilter<"Inverter"> | string | null
    providerUrl?: StringNullableFilter<"Inverter"> | string | null
    clientId?: StringFilter<"Inverter"> | string
    createdAt?: DateTimeFilter<"Inverter"> | Date | string
    updatedAt?: DateTimeFilter<"Inverter"> | Date | string
    deletedAt?: DateTimeNullableFilter<"Inverter"> | Date | string | null
  }

  export type UserUpsertWithWhereUniqueWithoutClientInput = {
    where: UserWhereUniqueInput
    update: XOR<UserUpdateWithoutClientInput, UserUncheckedUpdateWithoutClientInput>
    create: XOR<UserCreateWithoutClientInput, UserUncheckedCreateWithoutClientInput>
  }

  export type UserUpdateWithWhereUniqueWithoutClientInput = {
    where: UserWhereUniqueInput
    data: XOR<UserUpdateWithoutClientInput, UserUncheckedUpdateWithoutClientInput>
  }

  export type UserUpdateManyWithWhereWithoutClientInput = {
    where: UserScalarWhereInput
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyWithoutClientInput>
  }

  export type UserScalarWhereInput = {
    AND?: UserScalarWhereInput | UserScalarWhereInput[]
    OR?: UserScalarWhereInput[]
    NOT?: UserScalarWhereInput | UserScalarWhereInput[]
    id?: StringFilter<"User"> | string
    email?: StringFilter<"User"> | string
    name?: StringFilter<"User"> | string
    password?: StringFilter<"User"> | string
    roles?: StringNullableListFilter<"User">
    permissions?: StringNullableListFilter<"User">
    clientId?: StringNullableFilter<"User"> | string | null
    isActive?: BoolFilter<"User"> | boolean
    resetPasswordToken?: StringNullableFilter<"User"> | string | null
    resetPasswordExpires?: DateTimeNullableFilter<"User"> | Date | string | null
    createdAt?: DateTimeFilter<"User"> | Date | string
    updatedAt?: DateTimeFilter<"User"> | Date | string
  }

  export type IndicationUpsertWithWhereUniqueWithoutReferrerInput = {
    where: IndicationWhereUniqueInput
    update: XOR<IndicationUpdateWithoutReferrerInput, IndicationUncheckedUpdateWithoutReferrerInput>
    create: XOR<IndicationCreateWithoutReferrerInput, IndicationUncheckedCreateWithoutReferrerInput>
  }

  export type IndicationUpdateWithWhereUniqueWithoutReferrerInput = {
    where: IndicationWhereUniqueInput
    data: XOR<IndicationUpdateWithoutReferrerInput, IndicationUncheckedUpdateWithoutReferrerInput>
  }

  export type IndicationUpdateManyWithWhereWithoutReferrerInput = {
    where: IndicationScalarWhereInput
    data: XOR<IndicationUpdateManyMutationInput, IndicationUncheckedUpdateManyWithoutReferrerInput>
  }

  export type IndicationScalarWhereInput = {
    AND?: IndicationScalarWhereInput | IndicationScalarWhereInput[]
    OR?: IndicationScalarWhereInput[]
    NOT?: IndicationScalarWhereInput | IndicationScalarWhereInput[]
    id?: StringFilter<"Indication"> | string
    referrerId?: StringFilter<"Indication"> | string
    referredId?: StringFilter<"Indication"> | string
    status?: EnumIndicationStatusFilter<"Indication"> | $Enums.IndicationStatus
    createdAt?: DateTimeFilter<"Indication"> | Date | string
    updatedAt?: DateTimeFilter<"Indication"> | Date | string
  }

  export type IndicationUpsertWithWhereUniqueWithoutReferredInput = {
    where: IndicationWhereUniqueInput
    update: XOR<IndicationUpdateWithoutReferredInput, IndicationUncheckedUpdateWithoutReferredInput>
    create: XOR<IndicationCreateWithoutReferredInput, IndicationUncheckedCreateWithoutReferredInput>
  }

  export type IndicationUpdateWithWhereUniqueWithoutReferredInput = {
    where: IndicationWhereUniqueInput
    data: XOR<IndicationUpdateWithoutReferredInput, IndicationUncheckedUpdateWithoutReferredInput>
  }

  export type IndicationUpdateManyWithWhereWithoutReferredInput = {
    where: IndicationScalarWhereInput
    data: XOR<IndicationUpdateManyMutationInput, IndicationUncheckedUpdateManyWithoutReferredInput>
  }

  export type TransactionUpsertWithWhereUniqueWithoutClientInput = {
    where: TransactionWhereUniqueInput
    update: XOR<TransactionUpdateWithoutClientInput, TransactionUncheckedUpdateWithoutClientInput>
    create: XOR<TransactionCreateWithoutClientInput, TransactionUncheckedCreateWithoutClientInput>
  }

  export type TransactionUpdateWithWhereUniqueWithoutClientInput = {
    where: TransactionWhereUniqueInput
    data: XOR<TransactionUpdateWithoutClientInput, TransactionUncheckedUpdateWithoutClientInput>
  }

  export type TransactionUpdateManyWithWhereWithoutClientInput = {
    where: TransactionScalarWhereInput
    data: XOR<TransactionUpdateManyMutationInput, TransactionUncheckedUpdateManyWithoutClientInput>
  }

  export type TransactionScalarWhereInput = {
    AND?: TransactionScalarWhereInput | TransactionScalarWhereInput[]
    OR?: TransactionScalarWhereInput[]
    NOT?: TransactionScalarWhereInput | TransactionScalarWhereInput[]
    id?: StringFilter<"Transaction"> | string
    clientId?: StringFilter<"Transaction"> | string
    type?: EnumTransactionTypeFilter<"Transaction"> | $Enums.TransactionType
    amount?: FloatFilter<"Transaction"> | number
    description?: StringNullableFilter<"Transaction"> | string | null
    offerId?: StringNullableFilter<"Transaction"> | string | null
    indicationId?: StringNullableFilter<"Transaction"> | string | null
    createdAt?: DateTimeFilter<"Transaction"> | Date | string
  }

  export type ClientCreateWithoutInvertersInput = {
    id?: string
    name: string
    email: string
    cpfCnpj: string
    phone?: string | null
    address?: string | null
    avgEnergyCost?: number | null
    enelInvoiceFile?: string | null
    soloCoinBalance?: number
    indicationCode: string
    status?: $Enums.ClientStatus
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    users?: UserCreateNestedManyWithoutClientInput
    indicationsAsReferrer?: IndicationCreateNestedManyWithoutReferrerInput
    indicationsAsReferred?: IndicationCreateNestedManyWithoutReferredInput
    transactions?: TransactionCreateNestedManyWithoutClientInput
  }

  export type ClientUncheckedCreateWithoutInvertersInput = {
    id?: string
    name: string
    email: string
    cpfCnpj: string
    phone?: string | null
    address?: string | null
    avgEnergyCost?: number | null
    enelInvoiceFile?: string | null
    soloCoinBalance?: number
    indicationCode: string
    status?: $Enums.ClientStatus
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    users?: UserUncheckedCreateNestedManyWithoutClientInput
    indicationsAsReferrer?: IndicationUncheckedCreateNestedManyWithoutReferrerInput
    indicationsAsReferred?: IndicationUncheckedCreateNestedManyWithoutReferredInput
    transactions?: TransactionUncheckedCreateNestedManyWithoutClientInput
  }

  export type ClientCreateOrConnectWithoutInvertersInput = {
    where: ClientWhereUniqueInput
    create: XOR<ClientCreateWithoutInvertersInput, ClientUncheckedCreateWithoutInvertersInput>
  }

  export type GenerationUnitCreateWithoutInverterInput = {
    id?: string
    power: number
    energy: number
    generationUnitType?: string
    timestamp?: Date | string
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
  }

  export type GenerationUnitUncheckedCreateWithoutInverterInput = {
    id?: string
    power: number
    energy: number
    generationUnitType?: string
    timestamp?: Date | string
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
  }

  export type GenerationUnitCreateOrConnectWithoutInverterInput = {
    where: GenerationUnitWhereUniqueInput
    create: XOR<GenerationUnitCreateWithoutInverterInput, GenerationUnitUncheckedCreateWithoutInverterInput>
  }

  export type GenerationUnitCreateManyInverterInputEnvelope = {
    data: GenerationUnitCreateManyInverterInput | GenerationUnitCreateManyInverterInput[]
    skipDuplicates?: boolean
  }

  export type ClientUpsertWithoutInvertersInput = {
    update: XOR<ClientUpdateWithoutInvertersInput, ClientUncheckedUpdateWithoutInvertersInput>
    create: XOR<ClientCreateWithoutInvertersInput, ClientUncheckedCreateWithoutInvertersInput>
    where?: ClientWhereInput
  }

  export type ClientUpdateToOneWithWhereWithoutInvertersInput = {
    where?: ClientWhereInput
    data: XOR<ClientUpdateWithoutInvertersInput, ClientUncheckedUpdateWithoutInvertersInput>
  }

  export type ClientUpdateWithoutInvertersInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    cpfCnpj?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    address?: NullableStringFieldUpdateOperationsInput | string | null
    avgEnergyCost?: NullableFloatFieldUpdateOperationsInput | number | null
    enelInvoiceFile?: NullableStringFieldUpdateOperationsInput | string | null
    soloCoinBalance?: FloatFieldUpdateOperationsInput | number
    indicationCode?: StringFieldUpdateOperationsInput | string
    status?: EnumClientStatusFieldUpdateOperationsInput | $Enums.ClientStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    users?: UserUpdateManyWithoutClientNestedInput
    indicationsAsReferrer?: IndicationUpdateManyWithoutReferrerNestedInput
    indicationsAsReferred?: IndicationUpdateManyWithoutReferredNestedInput
    transactions?: TransactionUpdateManyWithoutClientNestedInput
  }

  export type ClientUncheckedUpdateWithoutInvertersInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    cpfCnpj?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    address?: NullableStringFieldUpdateOperationsInput | string | null
    avgEnergyCost?: NullableFloatFieldUpdateOperationsInput | number | null
    enelInvoiceFile?: NullableStringFieldUpdateOperationsInput | string | null
    soloCoinBalance?: FloatFieldUpdateOperationsInput | number
    indicationCode?: StringFieldUpdateOperationsInput | string
    status?: EnumClientStatusFieldUpdateOperationsInput | $Enums.ClientStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    users?: UserUncheckedUpdateManyWithoutClientNestedInput
    indicationsAsReferrer?: IndicationUncheckedUpdateManyWithoutReferrerNestedInput
    indicationsAsReferred?: IndicationUncheckedUpdateManyWithoutReferredNestedInput
    transactions?: TransactionUncheckedUpdateManyWithoutClientNestedInput
  }

  export type GenerationUnitUpsertWithWhereUniqueWithoutInverterInput = {
    where: GenerationUnitWhereUniqueInput
    update: XOR<GenerationUnitUpdateWithoutInverterInput, GenerationUnitUncheckedUpdateWithoutInverterInput>
    create: XOR<GenerationUnitCreateWithoutInverterInput, GenerationUnitUncheckedCreateWithoutInverterInput>
  }

  export type GenerationUnitUpdateWithWhereUniqueWithoutInverterInput = {
    where: GenerationUnitWhereUniqueInput
    data: XOR<GenerationUnitUpdateWithoutInverterInput, GenerationUnitUncheckedUpdateWithoutInverterInput>
  }

  export type GenerationUnitUpdateManyWithWhereWithoutInverterInput = {
    where: GenerationUnitScalarWhereInput
    data: XOR<GenerationUnitUpdateManyMutationInput, GenerationUnitUncheckedUpdateManyWithoutInverterInput>
  }

  export type GenerationUnitScalarWhereInput = {
    AND?: GenerationUnitScalarWhereInput | GenerationUnitScalarWhereInput[]
    OR?: GenerationUnitScalarWhereInput[]
    NOT?: GenerationUnitScalarWhereInput | GenerationUnitScalarWhereInput[]
    id?: StringFilter<"GenerationUnit"> | string
    power?: FloatFilter<"GenerationUnit"> | number
    energy?: FloatFilter<"GenerationUnit"> | number
    generationUnitType?: StringFilter<"GenerationUnit"> | string
    timestamp?: DateTimeFilter<"GenerationUnit"> | Date | string
    inverterId?: StringFilter<"GenerationUnit"> | string
    createdAt?: DateTimeFilter<"GenerationUnit"> | Date | string
    updatedAt?: DateTimeFilter<"GenerationUnit"> | Date | string
    deletedAt?: DateTimeNullableFilter<"GenerationUnit"> | Date | string | null
  }

  export type InverterCreateWithoutGenerationUnitsInput = {
    id?: string
    provider: string
    providerId: string
    providerApiKey?: string | null
    providerApiSecret?: string | null
    providerUrl?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    client: ClientCreateNestedOneWithoutInvertersInput
  }

  export type InverterUncheckedCreateWithoutGenerationUnitsInput = {
    id?: string
    provider: string
    providerId: string
    providerApiKey?: string | null
    providerApiSecret?: string | null
    providerUrl?: string | null
    clientId: string
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
  }

  export type InverterCreateOrConnectWithoutGenerationUnitsInput = {
    where: InverterWhereUniqueInput
    create: XOR<InverterCreateWithoutGenerationUnitsInput, InverterUncheckedCreateWithoutGenerationUnitsInput>
  }

  export type InverterUpsertWithoutGenerationUnitsInput = {
    update: XOR<InverterUpdateWithoutGenerationUnitsInput, InverterUncheckedUpdateWithoutGenerationUnitsInput>
    create: XOR<InverterCreateWithoutGenerationUnitsInput, InverterUncheckedCreateWithoutGenerationUnitsInput>
    where?: InverterWhereInput
  }

  export type InverterUpdateToOneWithWhereWithoutGenerationUnitsInput = {
    where?: InverterWhereInput
    data: XOR<InverterUpdateWithoutGenerationUnitsInput, InverterUncheckedUpdateWithoutGenerationUnitsInput>
  }

  export type InverterUpdateWithoutGenerationUnitsInput = {
    id?: StringFieldUpdateOperationsInput | string
    provider?: StringFieldUpdateOperationsInput | string
    providerId?: StringFieldUpdateOperationsInput | string
    providerApiKey?: NullableStringFieldUpdateOperationsInput | string | null
    providerApiSecret?: NullableStringFieldUpdateOperationsInput | string | null
    providerUrl?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    client?: ClientUpdateOneRequiredWithoutInvertersNestedInput
  }

  export type InverterUncheckedUpdateWithoutGenerationUnitsInput = {
    id?: StringFieldUpdateOperationsInput | string
    provider?: StringFieldUpdateOperationsInput | string
    providerId?: StringFieldUpdateOperationsInput | string
    providerApiKey?: NullableStringFieldUpdateOperationsInput | string | null
    providerApiSecret?: NullableStringFieldUpdateOperationsInput | string | null
    providerUrl?: NullableStringFieldUpdateOperationsInput | string | null
    clientId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type ClientCreateWithoutIndicationsAsReferrerInput = {
    id?: string
    name: string
    email: string
    cpfCnpj: string
    phone?: string | null
    address?: string | null
    avgEnergyCost?: number | null
    enelInvoiceFile?: string | null
    soloCoinBalance?: number
    indicationCode: string
    status?: $Enums.ClientStatus
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    inverters?: InverterCreateNestedManyWithoutClientInput
    users?: UserCreateNestedManyWithoutClientInput
    indicationsAsReferred?: IndicationCreateNestedManyWithoutReferredInput
    transactions?: TransactionCreateNestedManyWithoutClientInput
  }

  export type ClientUncheckedCreateWithoutIndicationsAsReferrerInput = {
    id?: string
    name: string
    email: string
    cpfCnpj: string
    phone?: string | null
    address?: string | null
    avgEnergyCost?: number | null
    enelInvoiceFile?: string | null
    soloCoinBalance?: number
    indicationCode: string
    status?: $Enums.ClientStatus
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    inverters?: InverterUncheckedCreateNestedManyWithoutClientInput
    users?: UserUncheckedCreateNestedManyWithoutClientInput
    indicationsAsReferred?: IndicationUncheckedCreateNestedManyWithoutReferredInput
    transactions?: TransactionUncheckedCreateNestedManyWithoutClientInput
  }

  export type ClientCreateOrConnectWithoutIndicationsAsReferrerInput = {
    where: ClientWhereUniqueInput
    create: XOR<ClientCreateWithoutIndicationsAsReferrerInput, ClientUncheckedCreateWithoutIndicationsAsReferrerInput>
  }

  export type ClientCreateWithoutIndicationsAsReferredInput = {
    id?: string
    name: string
    email: string
    cpfCnpj: string
    phone?: string | null
    address?: string | null
    avgEnergyCost?: number | null
    enelInvoiceFile?: string | null
    soloCoinBalance?: number
    indicationCode: string
    status?: $Enums.ClientStatus
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    inverters?: InverterCreateNestedManyWithoutClientInput
    users?: UserCreateNestedManyWithoutClientInput
    indicationsAsReferrer?: IndicationCreateNestedManyWithoutReferrerInput
    transactions?: TransactionCreateNestedManyWithoutClientInput
  }

  export type ClientUncheckedCreateWithoutIndicationsAsReferredInput = {
    id?: string
    name: string
    email: string
    cpfCnpj: string
    phone?: string | null
    address?: string | null
    avgEnergyCost?: number | null
    enelInvoiceFile?: string | null
    soloCoinBalance?: number
    indicationCode: string
    status?: $Enums.ClientStatus
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    inverters?: InverterUncheckedCreateNestedManyWithoutClientInput
    users?: UserUncheckedCreateNestedManyWithoutClientInput
    indicationsAsReferrer?: IndicationUncheckedCreateNestedManyWithoutReferrerInput
    transactions?: TransactionUncheckedCreateNestedManyWithoutClientInput
  }

  export type ClientCreateOrConnectWithoutIndicationsAsReferredInput = {
    where: ClientWhereUniqueInput
    create: XOR<ClientCreateWithoutIndicationsAsReferredInput, ClientUncheckedCreateWithoutIndicationsAsReferredInput>
  }

  export type ClientUpsertWithoutIndicationsAsReferrerInput = {
    update: XOR<ClientUpdateWithoutIndicationsAsReferrerInput, ClientUncheckedUpdateWithoutIndicationsAsReferrerInput>
    create: XOR<ClientCreateWithoutIndicationsAsReferrerInput, ClientUncheckedCreateWithoutIndicationsAsReferrerInput>
    where?: ClientWhereInput
  }

  export type ClientUpdateToOneWithWhereWithoutIndicationsAsReferrerInput = {
    where?: ClientWhereInput
    data: XOR<ClientUpdateWithoutIndicationsAsReferrerInput, ClientUncheckedUpdateWithoutIndicationsAsReferrerInput>
  }

  export type ClientUpdateWithoutIndicationsAsReferrerInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    cpfCnpj?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    address?: NullableStringFieldUpdateOperationsInput | string | null
    avgEnergyCost?: NullableFloatFieldUpdateOperationsInput | number | null
    enelInvoiceFile?: NullableStringFieldUpdateOperationsInput | string | null
    soloCoinBalance?: FloatFieldUpdateOperationsInput | number
    indicationCode?: StringFieldUpdateOperationsInput | string
    status?: EnumClientStatusFieldUpdateOperationsInput | $Enums.ClientStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    inverters?: InverterUpdateManyWithoutClientNestedInput
    users?: UserUpdateManyWithoutClientNestedInput
    indicationsAsReferred?: IndicationUpdateManyWithoutReferredNestedInput
    transactions?: TransactionUpdateManyWithoutClientNestedInput
  }

  export type ClientUncheckedUpdateWithoutIndicationsAsReferrerInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    cpfCnpj?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    address?: NullableStringFieldUpdateOperationsInput | string | null
    avgEnergyCost?: NullableFloatFieldUpdateOperationsInput | number | null
    enelInvoiceFile?: NullableStringFieldUpdateOperationsInput | string | null
    soloCoinBalance?: FloatFieldUpdateOperationsInput | number
    indicationCode?: StringFieldUpdateOperationsInput | string
    status?: EnumClientStatusFieldUpdateOperationsInput | $Enums.ClientStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    inverters?: InverterUncheckedUpdateManyWithoutClientNestedInput
    users?: UserUncheckedUpdateManyWithoutClientNestedInput
    indicationsAsReferred?: IndicationUncheckedUpdateManyWithoutReferredNestedInput
    transactions?: TransactionUncheckedUpdateManyWithoutClientNestedInput
  }

  export type ClientUpsertWithoutIndicationsAsReferredInput = {
    update: XOR<ClientUpdateWithoutIndicationsAsReferredInput, ClientUncheckedUpdateWithoutIndicationsAsReferredInput>
    create: XOR<ClientCreateWithoutIndicationsAsReferredInput, ClientUncheckedCreateWithoutIndicationsAsReferredInput>
    where?: ClientWhereInput
  }

  export type ClientUpdateToOneWithWhereWithoutIndicationsAsReferredInput = {
    where?: ClientWhereInput
    data: XOR<ClientUpdateWithoutIndicationsAsReferredInput, ClientUncheckedUpdateWithoutIndicationsAsReferredInput>
  }

  export type ClientUpdateWithoutIndicationsAsReferredInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    cpfCnpj?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    address?: NullableStringFieldUpdateOperationsInput | string | null
    avgEnergyCost?: NullableFloatFieldUpdateOperationsInput | number | null
    enelInvoiceFile?: NullableStringFieldUpdateOperationsInput | string | null
    soloCoinBalance?: FloatFieldUpdateOperationsInput | number
    indicationCode?: StringFieldUpdateOperationsInput | string
    status?: EnumClientStatusFieldUpdateOperationsInput | $Enums.ClientStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    inverters?: InverterUpdateManyWithoutClientNestedInput
    users?: UserUpdateManyWithoutClientNestedInput
    indicationsAsReferrer?: IndicationUpdateManyWithoutReferrerNestedInput
    transactions?: TransactionUpdateManyWithoutClientNestedInput
  }

  export type ClientUncheckedUpdateWithoutIndicationsAsReferredInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    cpfCnpj?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    address?: NullableStringFieldUpdateOperationsInput | string | null
    avgEnergyCost?: NullableFloatFieldUpdateOperationsInput | number | null
    enelInvoiceFile?: NullableStringFieldUpdateOperationsInput | string | null
    soloCoinBalance?: FloatFieldUpdateOperationsInput | number
    indicationCode?: StringFieldUpdateOperationsInput | string
    status?: EnumClientStatusFieldUpdateOperationsInput | $Enums.ClientStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    inverters?: InverterUncheckedUpdateManyWithoutClientNestedInput
    users?: UserUncheckedUpdateManyWithoutClientNestedInput
    indicationsAsReferrer?: IndicationUncheckedUpdateManyWithoutReferrerNestedInput
    transactions?: TransactionUncheckedUpdateManyWithoutClientNestedInput
  }

  export type ClientCreateWithoutTransactionsInput = {
    id?: string
    name: string
    email: string
    cpfCnpj: string
    phone?: string | null
    address?: string | null
    avgEnergyCost?: number | null
    enelInvoiceFile?: string | null
    soloCoinBalance?: number
    indicationCode: string
    status?: $Enums.ClientStatus
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    inverters?: InverterCreateNestedManyWithoutClientInput
    users?: UserCreateNestedManyWithoutClientInput
    indicationsAsReferrer?: IndicationCreateNestedManyWithoutReferrerInput
    indicationsAsReferred?: IndicationCreateNestedManyWithoutReferredInput
  }

  export type ClientUncheckedCreateWithoutTransactionsInput = {
    id?: string
    name: string
    email: string
    cpfCnpj: string
    phone?: string | null
    address?: string | null
    avgEnergyCost?: number | null
    enelInvoiceFile?: string | null
    soloCoinBalance?: number
    indicationCode: string
    status?: $Enums.ClientStatus
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    inverters?: InverterUncheckedCreateNestedManyWithoutClientInput
    users?: UserUncheckedCreateNestedManyWithoutClientInput
    indicationsAsReferrer?: IndicationUncheckedCreateNestedManyWithoutReferrerInput
    indicationsAsReferred?: IndicationUncheckedCreateNestedManyWithoutReferredInput
  }

  export type ClientCreateOrConnectWithoutTransactionsInput = {
    where: ClientWhereUniqueInput
    create: XOR<ClientCreateWithoutTransactionsInput, ClientUncheckedCreateWithoutTransactionsInput>
  }

  export type ClientUpsertWithoutTransactionsInput = {
    update: XOR<ClientUpdateWithoutTransactionsInput, ClientUncheckedUpdateWithoutTransactionsInput>
    create: XOR<ClientCreateWithoutTransactionsInput, ClientUncheckedCreateWithoutTransactionsInput>
    where?: ClientWhereInput
  }

  export type ClientUpdateToOneWithWhereWithoutTransactionsInput = {
    where?: ClientWhereInput
    data: XOR<ClientUpdateWithoutTransactionsInput, ClientUncheckedUpdateWithoutTransactionsInput>
  }

  export type ClientUpdateWithoutTransactionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    cpfCnpj?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    address?: NullableStringFieldUpdateOperationsInput | string | null
    avgEnergyCost?: NullableFloatFieldUpdateOperationsInput | number | null
    enelInvoiceFile?: NullableStringFieldUpdateOperationsInput | string | null
    soloCoinBalance?: FloatFieldUpdateOperationsInput | number
    indicationCode?: StringFieldUpdateOperationsInput | string
    status?: EnumClientStatusFieldUpdateOperationsInput | $Enums.ClientStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    inverters?: InverterUpdateManyWithoutClientNestedInput
    users?: UserUpdateManyWithoutClientNestedInput
    indicationsAsReferrer?: IndicationUpdateManyWithoutReferrerNestedInput
    indicationsAsReferred?: IndicationUpdateManyWithoutReferredNestedInput
  }

  export type ClientUncheckedUpdateWithoutTransactionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    cpfCnpj?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    address?: NullableStringFieldUpdateOperationsInput | string | null
    avgEnergyCost?: NullableFloatFieldUpdateOperationsInput | number | null
    enelInvoiceFile?: NullableStringFieldUpdateOperationsInput | string | null
    soloCoinBalance?: FloatFieldUpdateOperationsInput | number
    indicationCode?: StringFieldUpdateOperationsInput | string
    status?: EnumClientStatusFieldUpdateOperationsInput | $Enums.ClientStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    inverters?: InverterUncheckedUpdateManyWithoutClientNestedInput
    users?: UserUncheckedUpdateManyWithoutClientNestedInput
    indicationsAsReferrer?: IndicationUncheckedUpdateManyWithoutReferrerNestedInput
    indicationsAsReferred?: IndicationUncheckedUpdateManyWithoutReferredNestedInput
  }

  export type InverterCreateManyClientInput = {
    id?: string
    provider: string
    providerId: string
    providerApiKey?: string | null
    providerApiSecret?: string | null
    providerUrl?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
  }

  export type UserCreateManyClientInput = {
    id?: string
    email: string
    name: string
    password: string
    roles?: UserCreaterolesInput | string[]
    permissions?: UserCreatepermissionsInput | string[]
    isActive?: boolean
    resetPasswordToken?: string | null
    resetPasswordExpires?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type IndicationCreateManyReferrerInput = {
    id?: string
    referredId: string
    status?: $Enums.IndicationStatus
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type IndicationCreateManyReferredInput = {
    id?: string
    referrerId: string
    status?: $Enums.IndicationStatus
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TransactionCreateManyClientInput = {
    id?: string
    type: $Enums.TransactionType
    amount: number
    description?: string | null
    offerId?: string | null
    indicationId?: string | null
    createdAt?: Date | string
  }

  export type InverterUpdateWithoutClientInput = {
    id?: StringFieldUpdateOperationsInput | string
    provider?: StringFieldUpdateOperationsInput | string
    providerId?: StringFieldUpdateOperationsInput | string
    providerApiKey?: NullableStringFieldUpdateOperationsInput | string | null
    providerApiSecret?: NullableStringFieldUpdateOperationsInput | string | null
    providerUrl?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    generationUnits?: GenerationUnitUpdateManyWithoutInverterNestedInput
  }

  export type InverterUncheckedUpdateWithoutClientInput = {
    id?: StringFieldUpdateOperationsInput | string
    provider?: StringFieldUpdateOperationsInput | string
    providerId?: StringFieldUpdateOperationsInput | string
    providerApiKey?: NullableStringFieldUpdateOperationsInput | string | null
    providerApiSecret?: NullableStringFieldUpdateOperationsInput | string | null
    providerUrl?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    generationUnits?: GenerationUnitUncheckedUpdateManyWithoutInverterNestedInput
  }

  export type InverterUncheckedUpdateManyWithoutClientInput = {
    id?: StringFieldUpdateOperationsInput | string
    provider?: StringFieldUpdateOperationsInput | string
    providerId?: StringFieldUpdateOperationsInput | string
    providerApiKey?: NullableStringFieldUpdateOperationsInput | string | null
    providerApiSecret?: NullableStringFieldUpdateOperationsInput | string | null
    providerUrl?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type UserUpdateWithoutClientInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    roles?: UserUpdaterolesInput | string[]
    permissions?: UserUpdatepermissionsInput | string[]
    isActive?: BoolFieldUpdateOperationsInput | boolean
    resetPasswordToken?: NullableStringFieldUpdateOperationsInput | string | null
    resetPasswordExpires?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserUncheckedUpdateWithoutClientInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    roles?: UserUpdaterolesInput | string[]
    permissions?: UserUpdatepermissionsInput | string[]
    isActive?: BoolFieldUpdateOperationsInput | boolean
    resetPasswordToken?: NullableStringFieldUpdateOperationsInput | string | null
    resetPasswordExpires?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserUncheckedUpdateManyWithoutClientInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    roles?: UserUpdaterolesInput | string[]
    permissions?: UserUpdatepermissionsInput | string[]
    isActive?: BoolFieldUpdateOperationsInput | boolean
    resetPasswordToken?: NullableStringFieldUpdateOperationsInput | string | null
    resetPasswordExpires?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type IndicationUpdateWithoutReferrerInput = {
    id?: StringFieldUpdateOperationsInput | string
    status?: EnumIndicationStatusFieldUpdateOperationsInput | $Enums.IndicationStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    referred?: ClientUpdateOneRequiredWithoutIndicationsAsReferredNestedInput
  }

  export type IndicationUncheckedUpdateWithoutReferrerInput = {
    id?: StringFieldUpdateOperationsInput | string
    referredId?: StringFieldUpdateOperationsInput | string
    status?: EnumIndicationStatusFieldUpdateOperationsInput | $Enums.IndicationStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type IndicationUncheckedUpdateManyWithoutReferrerInput = {
    id?: StringFieldUpdateOperationsInput | string
    referredId?: StringFieldUpdateOperationsInput | string
    status?: EnumIndicationStatusFieldUpdateOperationsInput | $Enums.IndicationStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type IndicationUpdateWithoutReferredInput = {
    id?: StringFieldUpdateOperationsInput | string
    status?: EnumIndicationStatusFieldUpdateOperationsInput | $Enums.IndicationStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    referrer?: ClientUpdateOneRequiredWithoutIndicationsAsReferrerNestedInput
  }

  export type IndicationUncheckedUpdateWithoutReferredInput = {
    id?: StringFieldUpdateOperationsInput | string
    referrerId?: StringFieldUpdateOperationsInput | string
    status?: EnumIndicationStatusFieldUpdateOperationsInput | $Enums.IndicationStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type IndicationUncheckedUpdateManyWithoutReferredInput = {
    id?: StringFieldUpdateOperationsInput | string
    referrerId?: StringFieldUpdateOperationsInput | string
    status?: EnumIndicationStatusFieldUpdateOperationsInput | $Enums.IndicationStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TransactionUpdateWithoutClientInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: EnumTransactionTypeFieldUpdateOperationsInput | $Enums.TransactionType
    amount?: FloatFieldUpdateOperationsInput | number
    description?: NullableStringFieldUpdateOperationsInput | string | null
    offerId?: NullableStringFieldUpdateOperationsInput | string | null
    indicationId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TransactionUncheckedUpdateWithoutClientInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: EnumTransactionTypeFieldUpdateOperationsInput | $Enums.TransactionType
    amount?: FloatFieldUpdateOperationsInput | number
    description?: NullableStringFieldUpdateOperationsInput | string | null
    offerId?: NullableStringFieldUpdateOperationsInput | string | null
    indicationId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TransactionUncheckedUpdateManyWithoutClientInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: EnumTransactionTypeFieldUpdateOperationsInput | $Enums.TransactionType
    amount?: FloatFieldUpdateOperationsInput | number
    description?: NullableStringFieldUpdateOperationsInput | string | null
    offerId?: NullableStringFieldUpdateOperationsInput | string | null
    indicationId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type GenerationUnitCreateManyInverterInput = {
    id?: string
    power: number
    energy: number
    generationUnitType?: string
    timestamp?: Date | string
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
  }

  export type GenerationUnitUpdateWithoutInverterInput = {
    id?: StringFieldUpdateOperationsInput | string
    power?: FloatFieldUpdateOperationsInput | number
    energy?: FloatFieldUpdateOperationsInput | number
    generationUnitType?: StringFieldUpdateOperationsInput | string
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type GenerationUnitUncheckedUpdateWithoutInverterInput = {
    id?: StringFieldUpdateOperationsInput | string
    power?: FloatFieldUpdateOperationsInput | number
    energy?: FloatFieldUpdateOperationsInput | number
    generationUnitType?: StringFieldUpdateOperationsInput | string
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type GenerationUnitUncheckedUpdateManyWithoutInverterInput = {
    id?: StringFieldUpdateOperationsInput | string
    power?: FloatFieldUpdateOperationsInput | number
    energy?: FloatFieldUpdateOperationsInput | number
    generationUnitType?: StringFieldUpdateOperationsInput | string
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}