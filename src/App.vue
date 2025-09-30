<template>
  <div class="app-container">
    <h1>PhyloVuewer</h1>
    <p>Phylogenetic tree visualization with external tree provider</p>
    
    <div class="controls-section">
      <!-- Keep FASTA loader for backward compatibility but make it optional -->
      <FastaLoader 
        v-if="useFastaMode"
        @update:fasta-content="handleFastaContent" 
      />
      <MetadataLoader @update:metadata="handleMetadata" />
    </div>
    
    <div v-if="isLoadingTree" class="loading-message">
      Fetching phylogenetic tree from external provider...
    </div>
    
    <div v-if="treeError" class="error-message">
      {{ treeError }}
    </div>
    
    <div class="main-content">
      <div class="side-panel">
        <SidePanel 
          :metadata="metadata" 
          :color-map="colorMap" 
          @update:color-map="handleColorMap" 
          @update:selected-field="handleSelectedField" 
          @update:search-term="handleSearchTerm"
        />
        
        <!-- Debug information -->
        <div v-if="debugInfo" class="debug-info">
          <h4>Debug Info:</h4>
          <pre>{{ debugInfo }}</pre>
        </div>
      </div>
      
      <div class="tree-container">
        <!-- Use biowasm PhyloTree only in FASTA mode -->
        <PhyloTree 
          v-if="useFastaMode && fastaContent"
          :fasta-content="fastaContent" 
          @tree-calculated="handleTreeCalculated"
        />
        
        <PhylocanvasViewer 
          v-if="newickTree"
          :newick="newickTree"
          :metadata="metadata"
          :color-map="colorMap"
          :selected-field="selectedField"
          :search-term="searchTerm"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import FastaLoader from './components/FastaLoader.vue'
import MetadataLoader from './components/MetadataLoader.vue'
import PhyloTree from './components/PhyloTree.vue'
import PhylocanvasViewer from './components/PhylocanvasViewer.vue'
import SidePanel from './components/SidePanel.vue'
import { TreeApiService } from './services/treeApi.ts'
import './App.css'

// Reactive state
const fastaContent = ref('')
const metadata = ref<Record<string, string>[]>([])
const newickTree = ref('')
const colorMap = ref<Record<string, string>>({})
const selectedField = ref<string | null>(null)
const searchTerm = ref('')
const debugInfo = ref('')
const isLoadingTree = ref(false)
const treeError = ref<string | null>(null)

// Configuration from URL parameters
const treeEndpoint = ref<string | null>(null)
const useFastaMode = ref(false)

// Helper function to get URL query parameters
const getUrlParam = (param: string): string | null => {
  const urlParams = new URLSearchParams(window.location.search)
  return urlParams.get(param)
}

// Initialize configuration on mount
onMounted(() => {
  const endpoint = getUrlParam('tree-endpoint')
  if (endpoint) {
    treeEndpoint.value = endpoint
    debugInfo.value += `\nTree endpoint configured: ${endpoint}`
  } else {
    // If no tree-endpoint is provided, use FASTA mode (backward compatibility)
    useFastaMode.value = true
    debugInfo.value += '\nNo tree-endpoint provided, using FASTA mode'
  }
})

// Fetch tree from external API
const fetchTreeFromApi = async (metadataRecords: Record<string, string>[]) => {
  if (!treeEndpoint.value) {
    debugInfo.value += '\nNo tree endpoint configured, skipping API fetch'
    return
  }

  isLoadingTree.value = true
  treeError.value = null

  try {
    const treeApiService = new TreeApiService(treeEndpoint.value)
    
    // Extract case IDs from metadata
    const caseIds = treeApiService.extractCaseIds(metadataRecords, 'seqdb_genome_identifier')
    debugInfo.value += `\nExtracted ${caseIds.length} case IDs from metadata`
    
    // Fetch tree from API
    const newick = await treeApiService.fetchTree(caseIds)
    debugInfo.value += `\nReceived Newick tree from API (${newick.length} characters)`
    
    newickTree.value = newick
  } catch (error) {
    const errorMessage = `Failed to fetch tree from API: ${(error as Error).message}`
    console.error(errorMessage, error)
    treeError.value = errorMessage
    debugInfo.value += `\nError: ${errorMessage}`
  } finally {
    isLoadingTree.value = false
  }
}

// Event handlers
const handleFastaContent = (content: string) => {
  fastaContent.value = content
}

const handleMetadata = (data: Record<string, string>[]) => {
  metadata.value = data
  debugInfo.value += `\nMetadata loaded: ${data.length} records`
  
  // If we have a tree endpoint and metadata, fetch the tree
  if (treeEndpoint.value && data.length > 0) {
    fetchTreeFromApi(data)
  }
}

const handleTreeCalculated = (newick: string) => {
  newickTree.value = newick
  debugInfo.value += `\nNewick tree generated, ${newick.length} characters`
}

const handleColorMap = (map: Record<string, string>) => {
  colorMap.value = map
}

const handleSelectedField = (field: string | null) => {
  selectedField.value = field
}

const handleSearchTerm = (term: string) => {
  searchTerm.value = term
}

// Watch for important state changes
watch(newickTree, (newTree) => {
  if (newTree) {
    debugInfo.value += `\nTree ready for visualization`
  }
})
</script>

<style scoped>
.app-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.controls-section {
  margin-bottom: 20px;
  display: flex;
  gap: 20px;
}

.loading-message {
  padding: 15px;
  background: #e3f2fd;
  border: 1px solid #2196f3;
  border-radius: 4px;
  color: #1976d2;
  font-weight: bold;
  margin-bottom: 15px;
}

.error-message {
  padding: 15px;
  background: #ffebee;
  border: 1px solid #f44336;
  border-radius: 4px;
  color: #c62828;
  margin-bottom: 15px;
}

.main-content {
  display: flex;
  gap: 20px;
  height: calc(100vh - 200px);
}

.side-panel {
  width: 20%;
  min-width: 250px;
}

.tree-container {
  flex: 1;
  min-height: 600px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.debug-info {
  margin-top: 20px;
  padding: 10px;
  background: #f5f5f5;
  border-radius: 4px;
  font-size: 12px;
}

.debug-info pre {
  margin: 0;
  white-space: pre-wrap;
}
</style>
