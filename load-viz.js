(() => {
  var $svgContainer = document.getElementById('results-viz'),
    $backwardButton = document.getElementById('prev-community'),
    $forwardButton = document.getElementById('next-community'),
    $communityNumber = document.getElementById('community-id'),
    $resultsSelectedPerson = document.getElementById('results-selected-person'),
    $resultsSelectedCommunityName = document.getElementById('results-selected-community-name'),
    $resultsSelectedCommunityAnalysis = document.getElementById('results-selected-community-analysis'),
    svgURL = "./assets/graph-representation.svg",
    communityURL = "./assets/viz-data.txt",
    maxCommunity = 9,
    colors = [
      '#048090',
      '#F68E69',
      '#B58874'
    ], chooseColors = ($circles, $centerCircle) => {
      var $allCircles = [...$circles];
      $allCircles.push($centerCircle);
      $allCircles.forEach(($circle) => {
        var idx = Math.floor(Math.random() * 3);
        $circle.setAttribute('fill', colors[idx]);
      });
    },
    selectMember = (idx, member, $circles) => {
      //       if (!member) {
      //         $resultsSelectedPerson.innerHTML = `<p>
      // <b>Touch an outer circle to select a community member</b>
      // <br>Information about the person you select will show here.</p>`;
      //         return;
      //       }
      $circles.forEach(($circle) => {
        if (parseInt($circle.getAttribute('data-circle')) === idx) {
          $circle.classList.add('selected');
        } else {
          $circle.classList.remove('selected');
        }
      });
      $resultsSelectedPerson.innerHTML = `<p><b>${member[0]}</b><br>${member[1]}</p>`;
    },
    renderViz = ($circles, $centerCircle, $interactiveCircles, communityIndex, selectedCommunity) => {
      console.log(selectedCommunity);

      $resultsSelectedCommunityName.innerText = selectedCommunity.name;
      $resultsSelectedCommunityAnalysis.innerText = selectedCommunity.analysis;


      var selectedMember = 0,
        $centerCircleInteractive = document.getElementById('center-circle-interactive');

      selectMember(selectedMember, selectedCommunity.members[selectedMember], $circles);

      $communityNumber.innerText = communityIndex + 1;
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
      chooseColors($circles, $centerCircle);

      // $circles.forEach(($circle) => {
      //   $circle.classList.remove('selected');
      // });
      // document.getElementById('circle0').classList.add('selected');

      $centerCircleInteractive.ontouchup = $centerCircleInteractive.onmouseup = () => {
        selectedMember += 1;
        if (selectedMember >= selectedCommunity.members.length) selectedMember = 0;
        selectMember(selectedMember, selectedCommunity.members[selectedMember], $circles);
      }
      $interactiveCircles.forEach(($interactiveCircle) => {
        $interactiveCircle.ontouchup = $interactiveCircle.onmouseup = function() {
          var circleNumber = this.getAttribute('data-circle');
          if (selectedMember === parseInt(circleNumber)) {
            return;
          }
          selectedMember = parseInt(circleNumber);
          // $circles.forEach(($circle) => {
          //   if ($circle.getAttribute('data-circle') == circleNumber) {
          //     $circle.classList.add('selected');
          //   } else {
          //     $circle.classList.remove('selected');
          //   }
          // });
          selectMember(selectedMember, selectedCommunity.members[selectedMember], $circles);
        };
      });
    },
    onLoadSVG = (communities) => {

      var $circles = [].slice.call(document.querySelectorAll('.viz-circle')),
        $centerCircle = document.getElementById('center-circle'),
        $interactiveCircles = [].slice.call(document.querySelectorAll('#interactiveCircles g')),
        communityIndex = 0,
        selectedCommunity = communities[communityIndex];


      $forwardButton.onclick = () => {
        if (communityIndex < maxCommunity) {
          communityIndex += 1;
          selectedCommunity = communities[communityIndex];
          renderViz($circles, $centerCircle, $interactiveCircles, communityIndex, selectedCommunity);
        }
      };

      $backwardButton.onclick = () => {
        if (communityIndex > 0) {
          communityIndex -= 1;
          selectedCommunity = communities[communityIndex];
          renderViz($circles, $centerCircle, $interactiveCircles, communityIndex, selectedCommunity);
        }
      };

      renderViz($circles, $centerCircle, $interactiveCircles, communityIndex, selectedCommunity);
    },
    parseCommunities = (communitiesText) => {
      var communitiesTextTrim = communitiesText.trim(),
        communitiesTextSplit = communitiesTextTrim.split('\n#\n'),
        communities = [];
      communitiesTextSplit.forEach(
        (communityText) => {
          var communityMembers = [],
            communityTextSplit = communityText.split('\n'),
            communityName = communityTextSplit[0],
            communityAnalysis = communityTextSplit[1];
          for (var i = 2; i < communityTextSplit.length; i += 2) {
            communityMembers.push([
              communityTextSplit[i],
              communityTextSplit[i + 1]
            ]);
          }
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
    networkPromises = Promise.all([
      makeRequest(svgURL),
      makeRequest(communityURL)
    ]);
  networkPromises.catch((error) => {
    alert(error);
  }).then((values) => {
    var svgText = values[0];
    var communitiesText = values[1];

    $svgContainer.innerHTML = svgText;
    var communities = parseCommunities(communitiesText);
    onLoadSVG(communities);
  });



})();