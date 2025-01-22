import { defaultConfig } from '@formkit/vue'
import { generateClasses } from '@formkit/themes'

const textClassification = {
  outer: 'form-control w-full',
  label: 'label',
  inner: 'relative',
  input: 'input input-bordered w-full focus:outline-none focus:border-primary',
  help: 'label label-text-alt text-base-content/70',
  messages: 'list-none p-0 mt-1 mb-0',
  message: 'label-text-alt text-error'
}

const boxClassification = {
  outer: 'form-control',
  label: 'label cursor-pointer',
  legend: 'label-text font-medium',
  fieldset: 'space-y-2',
  wrapper: 'flex items-center gap-2',
  help: 'label label-text-alt text-base-content/70',
  input: 'checkbox checkbox-primary',
  inner: 'flex items-center gap-2',
  messages: 'list-none p-0 mt-1 mb-0',
  message: 'label-text-alt text-error',
  'options-wrapper': 'flex flex-col gap-2',
  'options-help': 'label label-text-alt text-base-content/70',
  'options-option': 'flex items-center gap-2',
  'options-input': 'checkbox checkbox-primary',
  'options-label': 'label-text'
}

const buttonClassification = {
  wrapper: 'mb-1',
  input: 'btn btn-primary'
}

// Theme object
const theme = {
  global: {
    outer: 'form-control mb-4',
    help: 'label label-text-alt text-base-content/70',
    messages: 'list-none p-0 mt-1 mb-0',
    message: 'label-text-alt text-error',
    'label-outer': 'label',
    'label-inner': 'label-text font-medium'
  },
  text: textClassification,
  email: textClassification,
  url: textClassification,
  number: textClassification,
  tel: textClassification,
  password: textClassification,
  date: textClassification,
  search: textClassification,
  time: textClassification,
  'datetime-local': textClassification,
  textarea: {
    ...textClassification,
    input: 'textarea textarea-bordered w-full min-h-[100px] focus:outline-none focus:border-primary'
  },
  select: {
    ...textClassification,
    input: 'select select-bordered w-full focus:outline-none focus:border-primary'
  },
  checkbox: boxClassification,
  radio: {
    ...boxClassification,
    input: 'radio radio-primary',
    'options-input': 'radio radio-primary'
  },
  range: {
    ...textClassification,
    input: 'range range-primary w-full'
  },
  submit: buttonClassification,
  button: buttonClassification
}

export default defaultConfig({
  config: {
    classes: generateClasses(theme)
  }
}) 