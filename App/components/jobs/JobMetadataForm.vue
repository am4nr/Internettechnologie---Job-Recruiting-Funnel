<!-- components/jobs/JobMetadataForm.vue -->
<script setup lang="ts">
import type { Job } from '~/types/jobs'

const props = defineProps<{
  modelValue: Job
}>()

const emit = defineEmits<{
  'update:modelValue': [value: Job]
}>()

const job = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})
</script>

<template>
  <div class="card bg-base-100 shadow-xl">
    <div class="card-body">
      <h2 class="card-title mb-4">Job Details</h2>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Title -->
        <div class="form-control">
          <label class="label">
            <span class="label-text">Job Title</span>
          </label>
          <input
            v-model="job.title"
            type="text"
            class="input input-bordered"
            placeholder="e.g. Senior Software Engineer"
            required
          />
        </div>

        <!-- Department -->
        <div class="form-control">
          <label class="label">
            <span class="label-text">Department</span>
          </label>
          <input
            v-model="job.department"
            type="text"
            class="input input-bordered"
            placeholder="e.g. Engineering"
          />
        </div>

        <!-- Location -->
        <div class="form-control">
          <label class="label">
            <span class="label-text">Location</span>
          </label>
          <input
            v-model="job.location"
            type="text"
            class="input input-bordered"
            placeholder="e.g. San Francisco, CA"
          />
        </div>

        <!-- Salary Range -->
        <div class="form-control">
          <label class="label">
            <span class="label-text">Salary Range</span>
          </label>
          <input
            v-model="job.job_details.salary_range"
            type="text"
            class="input input-bordered"
            placeholder="e.g. $100,000 - $150,000"
          />
        </div>

        <!-- Status -->
        <div class="form-control">
          <label class="label">
            <span class="label-text">Status</span>
          </label>
          <select v-model="job.status" class="select select-bordered" required>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="closed">Closed</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      <!-- Description -->
      <div class="form-control mt-4">
        <label class="label">
          <span class="label-text">Description</span>
        </label>
        <textarea
          v-model="job.description"
          class="textarea textarea-bordered h-24"
          placeholder="Job description..."
          required
        />
      </div>

      <!-- Requirements -->
      <div class="form-control mt-4">
        <label class="label">
          <span class="label-text">Requirements</span>
        </label>
        <textarea
          v-model="job.job_details.requirements"
          class="textarea textarea-bordered h-24"
          placeholder="Enter requirements, one per line"
        />
      </div>

      <!-- Responsibilities -->
      <div class="form-control mt-4">
        <label class="label">
          <span class="label-text">Responsibilities</span>
        </label>
        <textarea
          v-model="job.job_details.responsibilities"
          class="textarea textarea-bordered h-24"
          placeholder="Enter responsibilities, one per line"
        />
      </div>
    </div>
  </div>
</template>