<script setup lang="ts">
import type { FormFieldCondition, StepCondition, ApplicationStep } from '~/types/form'
import { useConditions } from '~/composables/useConditions'

const props = defineProps<{
  conditions: (FormFieldCondition | StepCondition)[]
  currentStepIndex: number
  currentFieldIndex?: number
  steps: Ref<ApplicationStep[]>
}>()

const emit = defineEmits<{
  'update:conditions': [(FormFieldCondition | StepCondition)[]]
}>()

const { 
  getAvailableFields,
  getFieldOptions,
  hasFixedOptions
} = useConditions(props.steps)

const availableFields = computed(() => 
  getAvailableFields(props.currentStepIndex, props.currentFieldIndex)
)

const addCondition = () => {
  const newConditions = [...(props.conditions || [])]
  newConditions.push({
    field: '',
    operator: 'equals',
    value: ''
  })
  emit('update:conditions', newConditions)
}

const removeCondition = (index: number) => {
  const newConditions = [...(props.conditions || [])]
  newConditions.splice(index, 1)
  emit('update:conditions', newConditions)
}

const updateCondition = (index: number, updates: Partial<FormFieldCondition | StepCondition>) => {
  const newConditions = [...(props.conditions || [])]
  newConditions[index] = { ...newConditions[index], ...updates }
  emit('update:conditions', newConditions)
}

const handleFieldChange = (index: number, event: Event) => {
  const select = event.target as HTMLSelectElement
  if (select) {
    updateCondition(index, { field: select.value })
  }
}

const handleOperatorChange = (index: number, event: Event) => {
  const select = event.target as HTMLSelectElement
  if (select) {
    updateCondition(index, { operator: select.value as FormFieldConditionOperator })
  }
}

const handleValueChange = (index: number, event: Event) => {
  const input = event.target as HTMLInputElement | HTMLSelectElement
  if (input) {
    updateCondition(index, { value: input.value })
  }
}
</script>

<template>
  <div class="space-y-2">
    <div class="flex justify-between items-center">
      <div>
        <h4 class="font-semibold">Visibility Conditions</h4>
        <p class="text-sm text-gray-600">This will only be shown if all conditions are met</p>
      </div>
      <button 
        type="button"
        @click="addCondition"
        class="btn btn-ghost btn-sm"
      >
        <i class="fas fa-plus mr-2"></i> Add
      </button>
    </div>

    <div v-if="conditions?.length" class="space-y-4">
      <div 
        v-for="(condition, index) in conditions" 
        :key="index"
        class="grid grid-cols-[1fr,1fr,1fr,auto] gap-2 items-end bg-base-200 p-2 rounded"
      >
        <!-- Field Selection -->
        <div class="form-control">
          <label class="label">
            <span class="label-text">Field</span>
          </label>
          <select 
            :value="condition.field"
            @change="handleFieldChange(index, $event)"
            class="select select-bordered w-full" 
            required
          >
            <option value="">Select field</option>
            <option
              v-for="field in availableFields"
              :key="field.id"
              :value="field.id"
            >
              {{ field.stepTitle }} - {{ field.label }}
            </option>
          </select>
        </div>
        
        <!-- Operator Selection -->
        <div class="form-control">
          <label class="label">
            <span class="label-text">Operator</span>
          </label>
          <select 
            :value="condition.operator"
            @change="handleOperatorChange(index, $event)"
            class="select select-bordered w-full" 
            required
          >
            <option value="equals">Equals</option>
            <option value="not_equals">Not equals</option>
            <option value="greater_than">Greater than</option>
            <option value="less_than">Less than</option>
            <option value="contains">Contains</option>
            <option value="not_contains">Does not contain</option>
            <option value="is_empty">Is empty</option>
            <option value="is_not_empty">Is not empty</option>
          </select>
        </div>
        
        <!-- Value Input -->
        <div v-if="!['is_empty', 'is_not_empty'].includes(condition.operator)" class="form-control">
          <label class="label">
            <span class="label-text">Value</span>
          </label>
          
          <!-- For fields with fixed options -->
          <select
            v-if="hasFixedOptions(
              availableFields.find(f => f.id === condition.field)?.type
            )"
            :value="condition.value"
            @change="handleValueChange(index, $event)"
            class="select select-bordered w-full"
            required
          >
            <option value="">Select value</option>
            <option
              v-for="option in getFieldOptions(condition.field)"
              :key="option.value"
              :value="option.value"
            >
              {{ option.label }}
            </option>
          </select>

          <!-- For number fields -->
          <input
            v-else-if="['number'].includes(
              availableFields.find(f => f.id === condition.field)?.type || ''
            )"
            type="number"
            :value="condition.value"
            @input="handleValueChange(index, $event)"
            class="input input-bordered w-full"
            required
          />

          <!-- For text and other fields -->
          <input
            v-else
            type="text"
            :value="condition.value"
            @input="handleValueChange(index, $event)"
            class="input input-bordered w-full"
            required
          />
        </div>
        
        <!-- Remove Button -->
        <button 
          type="button"
          @click="removeCondition(index)" 
          class="btn btn-ghost btn-square self-end"
        >
          <i class="fas fa-times"></i>
        </button>
      </div>
    </div>
    
    <div v-else class="text-center py-4 text-gray-500">
      No conditions added yet
    </div>
  </div>
</template> 