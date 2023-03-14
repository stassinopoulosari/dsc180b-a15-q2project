(() => {
  // Store HTML elements for important controls and views
  var $svgContainer = document.getElementById('results-viz'),
    $backwardButton = document.getElementById('prev-community'),
    $forwardButton = document.getElementById('next-community'),
    $communityNumber = document.getElementById('community-id'),
    $resultsSelectedPerson = document.getElementById('results-selected-person'),
    $resultsSelectedCommunityName = document.getElementById('results-selected-community-name'),
    $resultsSelectedCommunityAnalysis = document.getElementById('results-selected-community-analysis'),
    // URLs for files we will load in XHR later
    svgURL = "./assets/graph-representation.svg",
    communityURL = "./assets/viz-data.txt",
    // Number of communities
    maxCommunity = 9,
    // Colors for the circles (choose randomly)
    colors = [
      '#048090',
      '#F68E69',
      '#B58874'
    ],
    //Set the circles + the center circle to random background colors
    chooseColors = ($circles, $centerCircle) => {
      var $allCircles = [...$circles];
      $allCircles.push($centerCircle);
      $allCircles.forEach(($circle) => {
        var idx = Math.floor(Math.random() * 3);
        $circle.setAttribute('fill', colors[idx]);
      });
    },
    //Select an arbitrary circle (give it a border and show results for the person)
    selectMember = (idx, member, $circles) => {
      $circles.forEach(($circle) => {
        if (parseInt($circle.getAttribute('data-circle')) === idx) {
          $circle.classList.add('selected');
        } else {
          $circle.classList.remove('selected');
        }
      });
      $resultsSelectedPerson.innerHTML = `<p><b>${member[0]}</b><br>${member[1]}</p>`;
    },
    //Render the visualization (ran every time a new *community* is selected)
    renderViz = (
      $circles,
      $centerCircle,
      $interactiveCircles,
      communityIndex,
      selectedCommunity
    ) => {

      //Put the name and analysis on the page
      $resultsSelectedCommunityName.innerText = selectedCommunity.name;
      $resultsSelectedCommunityAnalysis.innerText = selectedCommunity.analysis;


      //Select the first member
      var selectedMember = 0,
        $centerCircleInteractive = document.getElementById('center-circle-interactive');

      selectMember(selectedMember, selectedCommunity.members[selectedMember], $circles);

      //Show the community number
      $communityNumber.innerText = communityIndex + 1;

      //Ensure we cannot go out of bounds
      if (communityIndex == maxCommunity) {
        $forwardButton.disabled = true;
      } else {
        $forwardButton.disabled = false;
      }
      if (communityIndex == 0) {
        $backwardButton.disabled = true;
      } else {
        $backwardButton.disabled = false;
      }

      //Re-color the circles randomly
      chooseColors($circles, $centerCircle);

      //Make the center circle cycle through the community members
      $centerCircleInteractive.ontouchup = $centerCircleInteractive.onmouseup = () => {
        selectedMember += 1;
        if (selectedMember >= selectedCommunity.members.length) selectedMember = 0;
        selectMember(selectedMember, selectedCommunity.members[selectedMember], $circles);
      }

      //Make each of the outer circles select a given community member
      $interactiveCircles.forEach(($interactiveCircle) => {
        $interactiveCircle.ontouchup = $interactiveCircle.onmouseup = function() {
          var circleNumber = this.getAttribute('data-circle');
          if (selectedMember === parseInt(circleNumber)) {
            return;
          }
          selectedMember = parseInt(circleNumber);
          selectMember(selectedMember, selectedCommunity.members[selectedMember], $circles);
        };
      });
    },
    //Set up the forward and backward buttons and render the initial community
    onLoadSVG = (communities) => {

      //Get important elements within the SVG
      var $circles = [].slice.call(document.querySelectorAll('.viz-circle')),
        $centerCircle = document.getElementById('center-circle'),
        $interactiveCircles = [].slice.call(document.querySelectorAll('#interactiveCircles g')),
        //Start with community 0
        communityIndex = 0,
        selectedCommunity = communities[communityIndex];

      //Set up the forward and backward button events
      $forwardButton.ontouchup = $forwardButton.onclick = () => {
        if (communityIndex < maxCommunity) {
          communityIndex += 1;
          selectedCommunity = communities[communityIndex];
          renderViz($circles, $centerCircle, $interactiveCircles, communityIndex, selectedCommunity);
        }
      };

      $backwardButton.ontouchup = $backwardButton.onclick = () => {
        if (communityIndex > 0) {
          communityIndex -= 1;
          selectedCommunity = communities[communityIndex];
          renderViz($circles, $centerCircle, $interactiveCircles, communityIndex, selectedCommunity);
        }
      };

      // Render the initial community
      renderViz($circles, $centerCircle, $interactiveCircles, communityIndex, selectedCommunity);
    },
    //Parse communities loaded via XHR
    parseCommunities = (communitiesText) => {
      var communitiesTextTrim = communitiesText.trim(),
        //Separate communities with a line with only a '#' character
        communitiesTextSplit = communitiesTextTrim.split('\n#\n'),
        communities = [];
      //Parse an individual community
      communitiesTextSplit.forEach(
        (communityText) => {
          var communityMembers = [],
            communityTextSplit = communityText.split('\n'),
            //First two elements are the name and analysis
            communityName = communityTextSplit[0],
            communityAnalysis = communityTextSplit[1];
          // The rest are alternating username and description
          for (var i = 2; i < communityTextSplit.length; i += 2) {
            communityMembers.push([
              communityTextSplit[i],
              communityTextSplit[i + 1]
            ]);
          }
          //Add community to list
          communities.push({
            name: communityName,
            analysis: communityAnalysis,
            members: communityMembers
          });
        }
      );
      return communities;
    },
    makeRequest = (url) => {
      return new Promise((resolve, reject) => {
        //This is some highly boilerplated XHR code but it seems to work
        var xhr = new XMLHttpRequest();

        xhr.onreadystatechange = () => {
          if (xhr.readyState == 4) {
            if (xhr.status == 200) {
              return resolve(xhr.responseText);
            }
            return reject(xhr);
          }
        };
        xhr.open('GET', url, true);
        xhr.send();
      });
    },
    //Run the network requests concurrently
    networkPromises = Promise.all([
      makeRequest(svgURL),
      makeRequest(communityURL)
    ]);
  networkPromises.catch((error) => {
    alert(error);
  }).then((values) => {
    //When everything is loaded, parse the communities and load the SVG/
    var svgText = values[0];
    var communitiesText = values[1];

    $svgContainer.innerHTML = svgText;
    var communities = parseCommunities(communitiesText);
    onLoadSVG(communities);
  });
})();