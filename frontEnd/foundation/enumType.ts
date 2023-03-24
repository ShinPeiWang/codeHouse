export const GameType = {
    /** 老虎機 */
    slot: 'slot',
    /** 消除類 */
    crush: 'crush',
    /** 街機類 */
    street: 'street'
} as const;

// eslint-disable-next-line @typescript-eslint/no-redeclare
export type GameType = EnumType<typeof GameType>;