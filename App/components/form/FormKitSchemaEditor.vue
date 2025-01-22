<script setup lang="ts">
import type { FormKitSchemaNode } from '@formkit/core'
import { ref, computed } from 'vue'
import { nanoid } from 'nanoid'

const props = defineProps<{
  modelValue: FormKitSchemaNode[]
  supportedInputs: string[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: FormKitSchemaNode[]]
}>()

const schema = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const editingNode = ref<FormKitSchemaNode | null>(null)

// Add a new field
const addField = (type: string) => {
  const newField: FormKitSchemaNode = {
    $formkit: type,
    id: nanoid(),
    name: `field_${nanoid(6)}`,
    label: `New ${type} field`,
    validation: type === 'select' || type === 'radio' || type === 'checkbox' ? 'required' : undefined,
    options: type === 'select' || type === 'radio' || type === 'checkbox' ? [] : undefined
  }

  if (!schema.value[0].children) {
    schema.value[0].children = []
  }
  schema.value[0].children.push(newField)
}

// Remove a field
const removeField = (field: FormKitSchemaNode) => {
  if (!schema.value[0].children) return
  const index = schema.value[0].children.findIndex(f => f.id === field.id)
  if (index === -1) return
  schema.value[0].children.splice(index, 1)
}

// Move a field up
const moveFieldUp = (index: number) => {
  if (!schema.value[0].children || index <= 0) return
  const field = schema.value[0].children.splice(index, 1)[0]
  schema.value[0].children.splice(index - 1, 0, field)
}

// Move a field down
const moveFieldDown = (index: number) => {
  if (!schema.value[0].children || index >= schema.value[0].children.length - 1) return
  const field = schema.value[0].children.splice(index, 1)[0]
  schema.value[0].children.splice(index + 1, 0, field)
}

// Add an option to a field
const addOption = (field: FormKitSchemaNode) => {
  if (!field.options) field.options = []
  field.options.push({ label: '', value: '' })
}

// Remove an option from a field
const removeOption = (field: FormKitSchemaNode, index: number) => {
  if (!field.options) return
  field.options.splice(index, 1)
}

// Get field icon
const getFieldIcon = (type: string): string => {
  const icons: Record<string, string> = {
    text: 'fas fa-keyboard',
    textarea: 'fas fa-paragraph',
    select: 'fas fa-list',
    checkbox: 'fas fa-check-square',
    radio: 'fas fa-dot-circle'
  }
  return icons[type] || 'fas fa-question'
}
</script>

<template>
  <div class="space-y-6">
    <!-- Add Field Button -->
    <div class="flex justify-end">
      <div class="dropdown dropdown-end">
        <label tabindex="0" class="btn btn-primary btn-sm gap-2">
          <i class="fas fa-plus"></i>
          <span>Add Field</span>
        </label>
        <ul tabindex="0" class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
          <li v-for="type in supportedInputs" :key="type">
            <button @click.prevent="addField(type)" class="flex items-center gap-2">
              <i :class="[getFieldIcon(type)]"></i>
              {{ type.charAt(0).toUpperCase() + type.slice(1) }}
            </button>
          </li>
        </ul>
      </div>
    </div>

    <!-- Fields List -->
    <div class="space-y-4">
      <div 
        v-for="(field, index) in schema[0].children" 
        :key="field.id"
        class="card bg-base-100 shadow"
      >
        <div class="card-body">
          <div class="flex justify-between items-start">
            <div class="flex items-center gap-2">
              <div class="flex gap-1">
                <button 
                  v-if="index > 0"
                  class="btn btn-ghost btn-xs btn-square"
                  @click.prevent="moveFieldUp(index)"
                  aria-label="Move field up"
                >
                  <i class="fas fa-arrow-up"></i>
                </button>
                <button 
                  v-if="index < (schema[0].children?.length || 0) - 1"
                  class="btn btn-ghost btn-xs btn-square"
                  @click.prevent="moveFieldDown(index)"
                  aria-label="Move field down"
                >
                  <i class="fas fa-arrow-down"></i>
                </button>
              </div>
              <i :class="[getFieldIcon(field.$formkit)]"></i>
              <h4 class="font-medium">{{ field.label }}</h4>
            </div>
            <div class="flex items-center gap-2">
              <button 
                class="btn btn-ghost btn-xs"
                @click.prevent="editingNode = editingNode?.id === field.id ? null : field"
                aria-label="Edit field options"
              >
                <i class="fas fa-cog"></i>
                Options
              </button>
              <button 
                class="btn btn-ghost btn-xs btn-square text-error"
                @click.prevent="removeField(field)"
                aria-label="Remove field"
              >
                <i class="fas fa-times"></i>
              </button>
            </div>
          </div>

          <!-- Field Options -->
          <div v-if="editingNode?.id === field.id" class="mt-4">
            <FormKit
              type="form"
              :value="field"
              @input="value => Object.assign(field, value)"
              :actions="false"
            >
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormKit
                  type="text"
                  name="label"
                  label="Field Label"
                  validation="required"
                />
                <FormKit
                  type="text"
                  name="name"
                  label="Field Name"
                  validation="required"
                  help="Must be unique"
                />
                <FormKit
                  type="text"
                  name="help"
                  label="Help Text"
                />
                <FormKit
                  type="checkbox"
                  name="validation"
                  label="Required Field"
                  :value="field.validation === 'required'"
                  @input="value => field.validation = value ? 'required' : undefined"
                />
              </div>

              <!-- Field-specific options -->
              <div v-if="['select', 'radio', 'checkbox'].includes(field.$formkit)" class="mt-4">
                <div class="form-control">
                  <label class="label">
                    <span class="label-text font-medium">Options</span>
                  </label>
                  <div class="space-y-2">
                    <div 
                      v-for="(option, optionIndex) in field.options || []" 
                      :key="optionIndex"
                      class="flex gap-2"
                    >
                      <FormKit
                        type="text"
                        :value="option.label"
                        @input="value => {
                          if (!field.options) return
                          field.options[optionIndex] = {
                            ...field.options[optionIndex],
                            label: value as string,
                            value: value as string
                          }
                        }"
                        placeholder="Option"
                        validation="required"
                      />
                      <button 
                        class="btn btn-ghost btn-sm btn-square text-error"
                        @click.prevent="removeOption(field, optionIndex)"
                        aria-label="Remove option"
                      >
                        <i class="fas fa-times"></i>
                      </button>
                    </div>
                    <button 
                      class="btn btn-ghost btn-sm gap-2"
                      @click.prevent="addOption(field)"
                    >
                      <i class="fas fa-plus"></i>
                      Add Option
                    </button>
                  </div>
                </div>
              </div>
            </FormKit>
          </div>
        </div>
      </div>
    </div>
  </div>
</template> 