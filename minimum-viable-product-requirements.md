This document outlines the basic minimum viable product (MVP) requirements for the PhyloViewer project with an external tree provider. The goal of the MVP is to provide a functional and user-friendly web application for visualizing phylogenetic trees. The following sections detail the key features and functionalities that must be included in the MVP.

## Minimum viable product details

### File Handling:

* Load and parse a metadata file provided in TSV format which gets fetched through a URL parameter, this parameter should be called 'input-metadata'

### Visualization:

* Upon parsing the metadata file, the application must fetch the newick formatted tree by making an API call to a specified endpoint. The endpoint URL should be provided as a URL parameter called 'tree-endpoint'.
  * An example API call would look like: 
    ```json
    curl -X 'POST' \
    'https://localhost:8000/v1/retrieve/phylogenetic_tree' \
    -H 'accept: application/json' \
    -H 'Content-Type: application/json' \
    -d '{"case_ids":["018c3e98-5a42-091c-b777-aa4acfeb315d","018c3e98-5a42-19d8-d1b0-a0084feb5e43","018c3e98-5a42-6a2d-b1b3-81e53654671c","018c3e98-5a42-adfc-68e0-95ac13ddc6b3","018c3e98-5a42-b60b-9480-f3a2a04f4661","018c3e98-5a42-c479-2f1a-dbb1e7a72ca9"],"genetic_distance_case_type_col_id":"0191c0e1-041b-47c0-1863-3b189ba40963","tree_algorithm_code":"SLINK"}'
    ```
    Here, the `case_ids` are derived from the metadata file, specifically the `seqdb_genome_identifier` column. The `genetic_distance_case_type_col_id` is a fixed value for this MVP.
    Localhost should be replaced with the URL parameter 'tree-endpoint'

  * A response from the API will look like:
    ```json
    {
      "id": null,
      "tree_algorithm_id": null,
      "tree_algorithm": null,
      "tree_algorithm_code": "SLINK",
      "genetic_distance_protocol_id": "018e939f-fcd8-feac-ee5a-4ba5018c96bc",
      "genetic_distance_protocol": null,
      "leaf_ids": [
        "018c3e98-5a42-091c-b777-aa4acfeb315d",
        "018c3e98-5a42-19d8-d1b0-a0084feb5e43",
        "018c3e98-5a42-6a2d-b1b3-81e53654671c",
        "018c3e98-5a42-adfc-68e0-95ac13ddc6b3",
        "018c3e98-5a42-b60b-9480-f3a2a04f4661",
        "018c3e98-5a42-c479-2f1a-dbb1e7a72ca9"
      ],
      "sequence_ids": null,
      "newick_repr": "((018c3e98-5a42-b60b-9480-f3a2a04f4661:3.00,018c3e98-5a42-adfc-68e0-95ac13ddc6b3:3.00):1.00,(((018c3e98-5a42-19d8-d1b0-a0084feb5e43:0.00,018c3e98-5a42-091c-b777-aa4acfeb315d:0.00):0.00,018c3e98-5a42-6a2d-b1b3-81e53654671c:0.00):0.00,018c3e98-5a42-c479-2f1a-dbb1e7a72ca9:0.00):4.00);"
    }
    ```
    * The application must parse this response and extract the `newick_repr` field. This field must be given to the already existing PhyloCanvasGL component for rendering/visualization.

* The visualization must be interactive, allowing users to explore the phylogenetic tree by zooming, panning, and clicking on nodes to reveal more information.
* A user must have the ability to color-code nodes in the tree based on metadata fields. This should be configurable through a collapsible side-panel.
  * The color coding must happen based on the metadata fields provided in the TSV file. If a column contains a json dictionary, the keys of that dictionary should be used as options for color coding.
  * The metadata to tree node mapping should be done through the `seqdb_genome_identifier` column in the metadata file, which corresponds to the leaf names in the newick formatted tree.
  * The application must provide a legend or key to explain the color-coding scheme used in the tree visualization.
  * The side-panel must also allow users to search for specific nodes or metadata attributes in the tree.
* The visualization pane must include a ruler that scales to the distances and information in the tree.
* The entire application should be hostable without a dedicated backend server, everything must happen client-side.


### Additional features
* A user should be able to navigate back to the source-information panel from the visualization pane, this should be done through a tooltip that contains a "Back to Source" link. The standardized link should be provided as a URL parameter called 'source-link'. The metadata will contain an accession, and this accession should be the identifier used in the "Back to Source" link. This final URL for linkbacks should look like: 'https://source-link.com/seq/{accession}'