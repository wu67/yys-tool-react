/**
 * 不加这几个类型定义的话, 组件使用时, 触发事件的响应方法会有类型相关的报错.
 * 这是从date-picker的index.d.ts里面抄出来的, 只把Moment换成了Dayjs.
 * 当然也可以选择不管/不重新定义类型, 但是要给每个响应方法的参数增加类型定义, 不能照搬官方文档的示例代码.
 */
// import { Dayjs } from 'dayjs'
// import type {
//   PickerDateProps,
//   PickerProps,
//   RangePickerProps as BaseRangePickerProps,
// } from 'antd/lib/date-picker/generatePicker'
// export declare type DatePickerProps = PickerProps<Dayjs>
// export declare type MonthPickerProps = Omit<PickerDateProps<Dayjs>, 'picker'>
// export declare type WeekPickerProps = Omit<PickerDateProps<Dayjs>, 'picker'>
// export declare type RangePickerProps = BaseRangePickerProps<Dayjs>
export { default as DatePicker } from './DatePicker'

export { default as Calendar } from './Calendar'
export { default as TimePicker } from './TimePicker'
