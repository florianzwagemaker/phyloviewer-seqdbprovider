export interface TreeApiRequest {
  case_ids: string[];
  genetic_distance_case_type_col_id: string;
  tree_algorithm_code: string;
}

export interface TreeApiResponse {
  id: string | null;
  tree_algorithm_id: string | null;
  tree_algorithm: string | null;
  tree_algorithm_code: string;
  genetic_distance_protocol_id: string;
  genetic_distance_protocol: string | null;
  leaf_ids: string[];
  sequence_ids: string[] | null;
  newick_repr: string;
}

export class TreeApiService {
  private endpoint: string;

  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }

  async fetchTree(
    caseIds: string[],
    geneticDistanceCaseTypeColId: string = '0191c0e1-041b-47c0-1863-3b189ba40963',
    treeAlgorithmCode: string = 'SLINK'
  ): Promise<string> {
    try {
      const requestBody: TreeApiRequest = {
        case_ids: caseIds,
        genetic_distance_case_type_col_id: geneticDistanceCaseTypeColId,
        tree_algorithm_code: treeAlgorithmCode
      };

      console.log('Fetching tree from API:', this.endpoint);
      console.log('Request body:', requestBody);

      const response = await fetch(`${this.endpoint}/v1/retrieve/phylogenetic_tree`, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: TreeApiResponse = await response.json();
      console.log('Tree API response:', data);

      if (!data.newick_repr) {
        throw new Error('No newick_repr found in API response');
      }

      return data.newick_repr;
    } catch (error) {
      console.error('Error fetching tree from API:', error);
      throw error;
    }
  }

  extractCaseIds(metadata: Record<string, string>[], columnName: string = 'seqdb_genome_identifier'): string[] {
    const caseIds = metadata
      .map(item => item[columnName])
      .filter(id => id && id.trim() !== '');

    if (caseIds.length === 0) {
      throw new Error(`No valid case IDs found in metadata column: ${columnName}`);
    }

    return caseIds;
  }
}