<!-- components/form/FormBuilder.vue -->
<script setup lang="ts">
import type { FormTemplate, FormStep, FormField } from '~/types/form'
import draggable from 'vuedraggable'
import BaseFormField from './FormField.vue'
import FormPreview from './FormPreview.vue'

const props = defineProps<{
  modelValue: FormTemplate
}>()

const emit = defineEmits<{
  'update:modelValue': [value: FormTemplate]
}>()

const { loading, error, saveTemplate } = useFormBuilder()
const activeStep = ref(0)

const addStep = () => {
  const newTemplate = { ...props.modelValue }
  newTemplate.steps.push({
    id: crypto.randomUUID(),
    title: 'New Step',
    description: '',
    orderIndex: newTemplate.steps.length + 1,
    fields: []
  })
  emit('update:modelValue', newTemplate)
  activeStep.value = newTemplate.steps.length - 1
}

const removeStep = (index: number) => {
  if (props.modelValue.steps.length === 1) return
  const newTemplate = { ...props.modelValue }
  newTemplate.steps.splice(index, 1)
  emit('update:modelValue', newTemplate)
  if (activeStep.value >= newTemplate.steps.length) {
    activeStep.value = newTemplate.steps.length - 1
  }
}

const editingField = ref<FormField | null>(null)
const configTab = ref('options')
const isDraggingOver = ref(false)
const isPreviewMode = ref(false)

// Field type registration
const fieldTypes = [
  { value: 'text', component: 'TextField', label: 'Text Input', icon: 'fa-keyboard', isTemplate: true },
  { value: 'textarea', component: 'TextareaField', label: 'Text Area', icon: 'fa-paragraph', isTemplate: true },
  { value: 'select', component: 'SelectField', label: 'Select', icon: 'fa-list', isTemplate: true },
  { value: 'checkbox', component: 'CheckboxField', label: 'Checkbox', icon: 'fa-check-square', isTemplate: true },
  { value: 'radio', component: 'RadioField', label: 'Radio', icon: 'fa-circle', isTemplate: true },
  { value: 'file', component: 'FileField', label: 'File Upload', icon: 'fa-upload', isTemplate: true },
  { value: 'range', component: 'RangeField', label: 'Range', icon: 'fa-sliders-h', isTemplate: true },
  { value: 'rating', component: 'RatingField', label: 'Rating', icon: 'fa-star', isTemplate: true },
  { value: 'toggle', component: 'ToggleField', label: 'Toggle', icon: 'fa-toggle-on', isTemplate: true }
]

const handleDragStart = () => {
  isDraggingOver.value = true
}

const handleDragEnd = () => {
  isDraggingOver.value = false
}

const handleDrop = (event: any) => {
  isDraggingOver.value = false
  if (event.added && event.added.element.isTemplate) {
    const type = event.added.element.value
    const newField: FormField = {
      id: crypto.randomUUID(),
      type,
      label: `New ${type} field`,
      required: false,
      orderIndex: props.modelValue.steps[activeStep.value].fields.length + 1,
      options: getDefaultOptionsForType(type),
      validation: {}
    }
    
    const newTemplate = { ...props.modelValue }
    newTemplate.steps[activeStep.value].fields.splice(event.added.newIndex, 1, newField)
    emit('update:modelValue', newTemplate)

    // Initialize preview value
    if (isPreviewMode.value) {
      previewValues.value[newField.id] = getPreviewValue(newField)
    }
  }
}

const getDefaultOptionsForType = (type: string) => {
  switch(type) {
    case 'text':
      return { inputType: 'text', placeholder: '' }
    case 'textarea':
      return { rows: 4, placeholder: '' }
    case 'select':
    case 'radio':
    case 'checkbox':
      return { choices: [] }
    case 'range':
      return { min: 0, max: 100, step: 1 }
    case 'rating':
      return { max: 5 }
    default:
      return {}
  }
}

const saveFieldChanges = () => {
  if (!editingField.value) return
  const newTemplate = { ...props.modelValue }
  const fieldIndex = newTemplate.steps[activeStep.value].fields.findIndex(f => f.id === editingField.value?.id)
  if (fieldIndex > -1) {
    newTemplate.steps[activeStep.value].fields[fieldIndex] = editingField.value
    emit('update:modelValue', newTemplate)
  }
  editingField.value = null
}

const deleteField = (field: FormField) => {
  const newTemplate = { ...props.modelValue }
  const fieldIndex = newTemplate.steps[activeStep.value].fields.findIndex(f => f.id === field.id)
  if (fieldIndex > -1) {
    newTemplate.steps[activeStep.value].fields.splice(fieldIndex, 1)
    emit('update:modelValue', newTemplate)
  }
}

// Add preview data state
const previewValues = ref<Record<string, any>>({})

// Get preview value for a field
const getPreviewValue = (field: FormField) => {
  if (!field) return null
  
  if (previewValues.value[field.id]) {
    return previewValues.value[field.id]
  }

  // Set initial preview value based on field type
  const value = (() => {
    switch(field.type) {
      case 'text':
        return field.options?.placeholder || 'Sample text'
      case 'textarea':
        return field.options?.placeholder || 'Sample text\nNew line'
      case 'select':
      case 'radio':
        return field.options?.choices?.[0]?.value || ''
      case 'checkbox':
        return field.options?.choices?.[0]?.value || false
      case 'range':
        return (field.options?.max || 100) / 2
      case 'rating':
        return Math.ceil((field.options?.max || 5) / 2)
      case 'toggle':
        return true
      case 'file':
        return null
      default:
        return ''
    }
  })()

  previewValues.value[field.id] = value
  return value
}

const handleSave = async () => {
  try {
    await saveTemplate(props.modelValue)
  } catch (err) {
    console.error('Error saving template:', err)
  }
}
</script>

<template>
  <div class="space-y-4">
    <!-- Steps Navigation with Preview Toggle -->
    <div class="flex justify-between items-center">
      <div class="flex-1">
        <ul class="steps steps-horizontal w-full">
          <li v-for="(step, index) in modelValue.steps" 
              :key="step.id"
              class="step cursor-pointer"
              :class="{ 'step-primary': index <= activeStep }"
              @click="activeStep = index">
            {{ step.title || `Step ${index + 1}` }}
          </li>
        </ul>
      </div>
      <label class="flex items-center gap-2 cursor-pointer">
        <span class="label-text">Preview Mode</span>
        <input 
          type="checkbox"
          class="toggle toggle-primary"
          v-model="isPreviewMode"
        />
      </label>
    </div>

    <!-- Active Step -->
    <div v-if="modelValue.steps[activeStep]" class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <div class="flex justify-between items-start mb-6">
          <div class="space-y-4 flex-1">
            <input 
              v-model="modelValue.steps[activeStep].title"
              type="text"
              class="input input-bordered text-xl font-bold w-full"
              placeholder="Step Title"
            />
            <textarea
              v-model="modelValue.steps[activeStep].description"
              class="textarea textarea-bordered w-full"
              placeholder="Step Description"
            />
          </div>
          <button 
            @click="removeStep(activeStep)"
            class="btn btn-ghost btn-sm text-error"
            :disabled="modelValue.steps.length === 1"
          >
            <i class="fas fa-trash"></i>
          </button>
        </div>

        <!-- Field List -->
        <draggable
          v-model="modelValue.steps[activeStep].fields"
          :group="{ name: 'fields', pull: false, put: true }"
          item-key="id"
          class="space-y-2 min-h-[200px]"
          :class="{ 'border-2 border-dashed border-primary p-4': isDraggingOver }"
          @start="handleDragStart"
          @end="handleDragEnd"
          @add="handleDrop"
        >
          <template #item="{ element: field }">
            <BaseFormField
              :field="field"
              :component="fieldTypes.find(t => t.value === field.type)?.component"
              :preview="isPreviewMode"
              :model-value="isPreviewMode ? getPreviewValue(field) : undefined"
              @edit="editingField = field"
              @delete="deleteField(field)"
            />
          </template>
        </draggable>

        <!-- Field Types -->
        <div class="divider">Available Fields</div>
        <draggable
          :list="fieldTypes"
          :group="{ name: 'fields', pull: 'clone', put: false }"
          :sort="false"
          item-key="value"
          class="grid grid-cols-3 gap-4"
        >
          <template #item="{ element: type }">
            <div 
              class="card bg-base-200 cursor-move hover:bg-base-300 transition-colors"
            >
              <div class="card-body items-center text-center p-4">
                <i :class="['fas', type.icon, 'text-2xl']"></i>
                <h3 class="card-title text-sm">{{ type.label }}</h3>
              </div>
            </div>
          </template>
        </draggable>
      </div>
    </div>

    <!-- Add Step Button -->
    <button 
      @click="addStep"
      class="btn btn-primary w-full"
    >
      Add Step
    </button>

    <!-- Save Button -->
    <button 
      @click="handleSave"
      class="btn btn-success w-full"
      :disabled="loading"
    >
      {{ loading ? 'Saving...' : 'Save Template' }}
    </button>

    <!-- Error Display -->
    <div v-if="error" class="alert alert-error">
      {{ error }}
    </div>

    <!-- Field Editor Modal -->
    <dialog 
      class="modal" 
      :open="!!editingField"
    >
      <div class="modal-box">
        <h3 class="font-bold text-lg mb-4">Edit Field</h3>
        
        <!-- Tabs -->
        <div class="tabs tabs-boxed mb-4">
          <a 
            class="tab" 
            :class="{ 'tab-active': configTab === 'options' }"
            @click="configTab = 'options'"
          >
            Options
          </a>
          <a 
            class="tab"
            :class="{ 'tab-active': configTab === 'validation' }"
            @click="configTab = 'validation'"
          >
            Validation
          </a>
          <a 
            class="tab"
            :class="{ 'tab-active': configTab === 'conditions' }"
            @click="configTab = 'conditions'"
          >
            Conditions
          </a>
        </div>

        <template v-if="editingField">
          <!-- Basic Settings -->
          <div class="form-control w-full mb-4">
            <label class="label">
              <span class="label-text">Field Label</span>
            </label>
            <input 
              v-model="editingField.label"
              type="text" 
              class="input input-bordered w-full"
            />
          </div>

          <!-- Options Tab -->
          <div v-if="configTab === 'options'" class="space-y-4">
            <div class="form-control">
              <label class="label cursor-pointer">
                <span class="label-text">Required</span>
                <input 
                  type="checkbox"
                  class="checkbox"
                  v-model="editingField.required"
                />
              </label>
            </div>

            <!-- Field-specific options -->
            <template v-if="editingField.type === 'text'">
              <div class="form-control">
                <label class="label">
                  <span class="label-text">Placeholder</span>
                </label>
                <input 
                  v-model="editingField.options.placeholder"
                  type="text"
                  class="input input-bordered"
                />
              </div>
            </template>

            <template v-if="editingField.type === 'select' || editingField.type === 'radio' || editingField.type === 'checkbox'">
              <div class="space-y-2">
                <label class="label">
                  <span class="label-text">Choices</span>
                </label>
                <div 
                  v-for="(choice, index) in editingField.options.choices"
                  :key="index"
                  class="flex gap-2"
                >
                  <input 
                    v-model="choice.label"
                    type="text"
                    class="input input-bordered flex-1"
                    placeholder="Label"
                  />
                  <input 
                    v-model="choice.value"
                    type="text"
                    class="input input-bordered flex-1"
                    placeholder="Value"
                  />
                  <button 
                    @click="editingField.options.choices.splice(index, 1)"
                    class="btn btn-ghost btn-sm text-error"
                  >
                    <i class="fas fa-times"></i>
                  </button>
                </div>
                <button 
                  @click="editingField.options.choices.push({ label: '', value: '' })"
                  class="btn btn-ghost btn-sm"
                >
                  Add Choice
                </button>
              </div>
            </template>
          </div>

          <!-- Validation Tab -->
          <div v-if="configTab === 'validation'" class="space-y-4">
            <div class="form-control">
              <label class="label">
                <span class="label-text">Minimum Value</span>
              </label>
              <input 
                v-model.number="editingField.validation.min"
                type="number"
                class="input input-bordered"
              />
            </div>

            <div class="form-control">
              <label class="label">
                <span class="label-text">Maximum Value</span>
              </label>
              <input 
                v-model.number="editingField.validation.max"
                type="number"
                class="input input-bordered"
              />
            </div>

            <div class="form-control">
              <label class="label">
                <span class="label-text">Pattern (Regex)</span>
              </label>
              <input 
                v-model="editingField.validation.pattern"
                type="text"
                class="input input-bordered"
              />
            </div>

            <div class="form-control">
              <label class="label">
                <span class="label-text">Error Message</span>
              </label>
              <input 
                v-model="editingField.validation.message"
                type="text"
                class="input input-bordered"
              />
            </div>
          </div>

          <!-- Conditions Tab -->
          <div v-if="configTab === 'conditions'" class="space-y-4">
            <div class="form-control">
              <label class="label cursor-pointer">
                <span class="label-text">Enable Conditions</span>
                <input 
                  type="checkbox"
                  class="toggle"
                  v-model="editingField.isConditional"
                />
              </label>
            </div>

            <template v-if="editingField.isConditional">
              <div class="form-control">
                <label class="label">
                  <span class="label-text">Condition Type</span>
                </label>
                <select 
                  v-model="editingField.conditionLogic.type"
                  class="select select-bordered"
                >
                  <option value="AND">All conditions must match (AND)</option>
                  <option value="OR">Any condition must match (OR)</option>
                </select>
              </div>

              <div class="space-y-2">
                <div 
                  v-for="(condition, index) in editingField.conditionLogic.conditions"
                  :key="index"
                  class="card bg-base-200 p-4"
                >
                  <div class="space-y-2">
                    <select 
                      v-model="condition.fieldId"
                      class="select select-bordered w-full"
                    >
                      <option 
                        v-for="field in modelValue.steps[activeStep].fields"
                        :key="field.id"
                        :value="field.id"
                      >
                        {{ field.label }}
                      </option>
                    </select>

                    <select 
                      v-model="condition.operator"
                      class="select select-bordered w-full"
                    >
                      <option value="equals">Equals</option>
                      <option value="notEquals">Does not equal</option>
                      <option value="contains">Contains</option>
                      <option value="greaterThan">Greater than</option>
                      <option value="lessThan">Less than</option>
                    </select>

                    <input 
                      v-model="condition.value"
                      type="text"
                      class="input input-bordered w-full"
                      placeholder="Value"
                    />

                    <button 
                      @click="editingField.conditionLogic.conditions.splice(index, 1)"
                      class="btn btn-ghost btn-sm text-error"
                    >
                      Remove Condition
                    </button>
                  </div>
                </div>

                <button 
                  @click="editingField.conditionLogic.conditions.push({
                    fieldId: '',
                    operator: 'equals',
                    value: ''
                  })"
                  class="btn btn-ghost btn-sm"
                >
                  Add Condition
                </button>
              </div>
            </template>
          </div>
        </template>

        <div class="modal-action">
          <button 
            @click="editingField = null"
            class="btn"
          >
            Cancel
          </button>
          <button 
            @click="saveFieldChanges"
            class="btn btn-primary"
          >
            Save Changes
          </button>
        </div>
      </div>
    </dialog>
  </div>
</template>

<style scoped>
.sortable-ghost {
  opacity: 0.5;
}

.sortable-drag {
  cursor: grabbing;
}
</style>