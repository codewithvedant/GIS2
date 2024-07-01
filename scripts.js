let map;
let markers = [];
let addTreeMode = false;
let deleteTreeMode = false;
let selectedUprootType = null;
let trees = {}; // Store tree data for easy access

function initMap() {
    map = L.map('map').setView([51.505, -0.09], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    fetchTrees();

    map.on('click', function(event) {
        if (addTreeMode) {
            placeMarker(event.latlng);
        }
    });
}

document.getElementById('addTree').addEventListener('click', () => {
    addTreeMode = true;
    deleteTreeMode = false;
    document.getElementById('form-container').style.display = 'block';
    document.getElementById('delete-form-container').style.display = 'none';
});

document.getElementById('deleteTree').addEventListener('click', () => {
    deleteTreeMode = true;
    addTreeMode = false;
    document.getElementById('delete-form-container').style.display = 'block';
    document.getElementById('form-container').style.display = 'none';
});

document.getElementById('treeForm').addEventListener('submit', function(event) {
    event.preventDefault();
    let treeName = document.getElementById('treeName').value;
    let marker = markers[markers.length - 1];
    saveTree(marker.getLatLng().lat, marker.getLatLng().lng, treeName);
});

document.getElementById('deleteTreeForm').addEventListener('submit', function(event) {
    event.preventDefault();
    if (selectedUprootType) {
        let upvote = document.getElementById('deleteUpvote').classList.contains('selected');
        let downvote = document.getElementById('deleteDownvote').classList.contains('selected');
        deleteTree(selectedUprootType, upvote, downvote);
    } else {
        alert('Please select an uproot type and vote.');
    }
});

document.getElementById('deleteUpvote').addEventListener('click', () => {
    document.getElementById('deleteUpvote').classList.add('selected');
    document.getElementById('deleteDownvote').classList.remove('selected');
});

document.getElementById('deleteDownvote').addEventListener('click', () => {
    document.getElementById('deleteDownvote').classList.add('selected');
    document.getElementById('deleteUpvote').classList.remove('selected');
});

document.querySelectorAll('input[name="uprootType"]').forEach(radio => {
    radio.addEventListener('change', function() {
        selectedUprootType = this.value;
    });
});

function placeMarker(location) {
    let marker = L.marker(location, {
        icon: L.icon({
            iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41]
        })
    }).addTo(map);
    markers.push(marker);
}

function saveTree(lat, lng, name) {
    fetch('/add_tree', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            lat: lat,
            lng: lng,
            name: name,
            upvotes: 0,
            downvotes: 0,
            dateAdded: new Date().toISOString()
        })
    }).then(response => response.json())
      .then(data => {
          alert('Tree added successfully!');
          document.getElementById('form-container').style.display = 'none';
          addTreeMode = false;
          fetchTrees(); // Refresh the tree markers
      });
}

function fetchTrees() {
    fetch('/get_trees')
        .then(response => response.json())
        .then(data => {
            markers.forEach(marker => map.removeLayer(marker)); // Remove existing markers
            markers = [];
            trees = {};
            data.forEach(tree => {
                trees[tree.id] = tree;
                let marker = L.marker([tree.latitude, tree.longitude], {
                    icon: L.icon({
                        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
                        iconSize: [25, 41],
                        iconAnchor: [12, 41]
                    })
                }).addTo(map);
                let popupContent = `<b>${tree.name}</b><br>Upvotes: ${tree.upvotes}<br>Downvotes: ${tree.downvotes}<br>
                                    <button onclick="upvoteTree(${tree.id})">Upvote</button>
                                    <button onclick="downvoteTree(${tree.id})">Downvote</button>`;
                marker.bindPopup(popupContent);
                markers.push(marker);
            });
            checkTreeVotes(); // Check vote criteria after fetching trees
        });
}

function upvoteTree(treeId) {
    fetch('/upvote_tree', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id: treeId })
    }).then(response => response.json())
      .then(data => {
          alert('Tree upvoted successfully!');
          fetchTrees(); // Refresh the tree markers
      });
}

function downvoteTree(treeId) {
    fetch('/downvote_tree', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id: treeId })
    }).then(response => response.json())
      .then(data => {
          alert('Tree downvoted successfully!');
          fetchTrees(); // Refresh the tree markers
      });
}

function deleteTree(uprootType, upvote, downvote) {
    fetch('/delete_tree', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            uprootType: uprootType,
            upvote: upvote,
            downvote: downvote
        })
    }).then(response => response.json())
      .then(data => {
          alert('Tree deletion request submitted successfully!');
          document.getElementById('delete-form-container').style.display = 'none';
          deleteTreeMode = false;
          fetchTrees(); // Refresh the tree markers
      });
}

function checkTreeVotes() {
    Object.values(trees).forEach(tree => {
        if (tree.upvotes >= 20 || tree.downvotes >= 20) {
            apply
        }
    });
}

initMap();
