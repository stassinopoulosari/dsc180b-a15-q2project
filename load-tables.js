(() => {
  const input = [
    `Knobblymonsters
An account centered around the british tabloid term “knobbly monster”
Charlie_crispy
British journalist at Lightbulb
GemmaParry4
Freelance British journalist, formerly BBC
Shamaan_SkyNews
British journalist at Sky News, formerly BBC
jamesjdunham
British reporter at ITV Meridan
EddieHenryJames
British videographer
ThatDavidHarper
British journalist / presenter at BBC
Sprosto
British journalist in sports
Craig_Simpson_
British writer for telegrapher
Olliesamuels
BBC journalist`.split('\n'),
    `Azarijacquan
Brooklyn musician
Rileyofhbc
Philadelphia rap group HBC member
Daveyxdave
Philadelphia Event Host
saidtheSADBOY
Emo/hip hop artist
MannBarnes
Philadelphia law research associate - Temple University
Frescomills
Philadelphia club manager
Dyymondwy
Philadelphia artist - Temple University
Yaz_ManianDevil
Temple University
Demelmichael

Mosesmosima_
Philadelphia rap group HBC member`.split('\n'),
    `IrishBlue1878
Brother of recent murder victim
Elaine_McGee10 
BBC journalist
Foleyjackie823
Women’s rights advocate
ColmMGE
Irish Actor
Emer_currie1
Irish Senator
TrevorLunnLV
Irish Politician
MuseumFreeDerry
Irish Museum
Maireadcleary7
Bauer Media Reporter
SwimmersJackson
Musician
Keirontourish
BBC Reporter`.split('\n'),
    `DrystemsPsych
Physician and children author
Stop_Smokin_now 
Health Promotor and Director of Stephenson Cancer Center
ty_renshaw
Associate professor of psychology @USUaggies
MaraNievesCabr1
Medical Nuclear HCSC Professor in Spain
RealCruzHenry
Health conspiracy theories
DulayMario
PHD in neurology
c_constan
Professor of Biomedical Engineering and Neuroscience
DrJackie Volk
CEO of disability resource center
ErikMessamoreMD
Physician and Pharmacologist 
daniel_e_adkins
Associate professor of sociology and psychiatry`.split('\n'),
    `hanbae
Writer, journalist and illustrator
Wm_McKenna 
Producer/Shooter/Editor
official_foz
Translator, writer, and newswriter
AidenHeung
Chinese existentialist poet
gibbsne
Executive editor for a book website
alextarquinio
Business writer for the New York Times
Dipesh_Nepal_
Book reviews and literature translator
lindsaymwong
Author
teacup_media
Chinese History Podcast, Media company
jess_esa
Freelance writer and book review writer`.split('\n'),
    `profdwh
Retired historian Irish
Tars18492599 
Historical book reviewer
Tachyon100
Ex racer in UK, supporter of Manchester City football club
mingall63
Former Labour Leader of Harlow Council in UK
brettturner57
Humanitarian politics account
enamhaque31
Manchester United football club supporter in England
ShareenIdu
International surgeon for Horse Grand Prix Showjumping
JohnBwaldron
Mental Health Nurse in Ireland
allentien
Psychiatry and Epidemiology MD 
annieashton2705
Political Campaigner in UK that advoactes against gambling as lost her husband to gambling suicide`.split('\n')];
  var data = input.map(
    (community, i) => {
      community = community.map((str) => str.trim());
      out = []
      for (var i = 0; i < community.length; i += 2) {
        out.push([community[i], community[i + 1]])
      }
      return out;
    }
  );
  data.forEach((list, i) => {
    const $table = document.querySelector(`#community-${i + 1}-tbody`);
    if (!$table) return;
    $table.innerHTML = list.map((tuple, i) => `<tr><td class='num-td'>${i + 1}</td><td>${tuple[0]}</td><td>${tuple[1]}</td>`).join('');
  });
})();