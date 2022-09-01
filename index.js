const createApp = async() => {
  const response = await fetch('https://us-central1-involvement-api.cloudfunctions.net/capstoneApi/apps/', {
    method: 'POST',
  });
  const r = await response.text();
  return r;
};

const addLike = async(itemID) => {
  let raw = {
    item_id: itemID,
  };
  raw = JSON.stringify(raw);
  const response = await fetch(`https://us-central1-involvement-api.cloudfunctions.net/capstoneApi/apps/${localStorage.getItem('myApp')}/likes/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: raw,
  });
  const res = await response.text();
  return res;
};

const getLikes = async() => {
  const response = await fetch(`https://us-central1-involvement-api.cloudfunctions.net/capstoneApi/apps/${localStorage.getItem('myApp')}/likes/`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  const res = await response.json();
  return res;
};

const getComments = async(id) => {
  try {
    const response = await fetch(`https://us-central1-involvement-api.cloudfunctions.net/capstoneApi/apps/${localStorage.getItem('myApp')}/comments?item_id=${id}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (response.status !== 200) {
      return [];
    }

    const res = await response.json();
    if (res.error) return [];
    return res;
  } catch (e) {
    return []
  }
};

const putComment = async(id, username, comment) => {
  const url = `https://us-central1-involvement-api.cloudfunctions.net/capstoneApi/apps/${localStorage.getItem('myApp')}/comments?item_id=${id}`;
  const raw = {
    username,
    comment,
    item_id: id,
  };

  const res = await fetch(url, {
    method: 'POST',
    body: JSON.stringify(raw),
    headers: { 'Content-Type': 'application/json' },
  });
};

const fetchTotalPokemons = async() => {
  const url = 'https://pokeapi.co/api/v2/pokemon?limit=100000&offset=0';
  const res = await fetch(url);
  let maxPokemons = await res.json();
  maxPokemons = maxPokemons.count;
  return maxPokemons;
};

let myApp;
let pageNumber = 1;
const pokeContainer = document.getElementById('pokemons');
const from = document.getElementById('from');
const to = document.getElementById('to');
const total = document.getElementById('total');
const pokemonsNumber = 9;
let maxPokemons;
let openedOverlayID;
const colors = {
  fire: '#FDDFDF',
  grass: '#DEFDE0',
  electric: '#FCF7DE',
  water: '#DEF3FD',
  ground: '#f4e7da',
  rock: '#d5d5d4',
  fairy: '#fceaff',
  poison: '#98d7a5',
  bug: '#f8d5a3',
  dragon: '#97b3e6',
  psychic: '#eaeda1',
  flying: '#F5F5F5',
  fighting: '#E6E0D4',
  normal: '#F5F5F5',
};
const mainTypes = Object.keys(colors);

const fetchPokemons = async() => {
  pokeContainer.innerHTML = '';
  const start = (pageNumber * pokemonsNumber) - 8;
  from.innerHTML = start.toString();
  to.innerHTML = (start + pokemonsNumber - 1).toString();
  total.innerHTML = maxPokemons.toString();
  for (let i = start; i < (start + pokemonsNumber); i += 1) {

    await getPokemon(i);
  }

  getLikes().then((likes) => {
    likes.forEach((like) => {
      try {
        document.getElementById(like.item_id).innerHTML = like.likes;
      } catch (e) {}
    });
  });
  const likeBtn = document.querySelectorAll('.heartbtn');

  for (let i = 0; i < likeBtn.length; i += 1) {
    likeBtn[i].addEventListener('click', (e) => {
      const el = e.target.parentNode.parentNode.parentNode.children[3].children[1].children[0];
      const elem = document.getElementById(el.id);
      addLike(el.id);
      elem.innerHTML = parseInt(elem.innerHTML, 10) + 1;
    });
  }

  const commentBtn = document.querySelectorAll('.commentBtn');
  for (let i = 0; i < commentBtn.length; i += 1) {
    commentBtn[i].addEventListener('click', (e) => {
      const el = e.target.parentNode.children[3].children[1].children[0];

      fillOverlay(el.id);
    });
  }
};

const getPokemon = async(id) => {
  const url = `https://pokeapi.co/api/v2/pokemon/${id}`;
  const res = await fetch(url);
  const pokemon = await res.json();

  createPokemonCard(pokemon);
};

function createPokemonCard(pokemon) {
  const pokemonEl = document.createElement('div');
  pokemonEl.classList.add('pokemon');

  const pokeTypes = pokemon.types.map((type) => type.type.name);
  const type = mainTypes.find((type) => pokeTypes.indexOf(type) > -1);
  const name = pokemon.name[0].toUpperCase() + pokemon.name.slice(1);
  const color = colors[type];

  pokemonEl.style.backgroundColor = color;

  const pokeInnerHTML = `
  <div class="pokebox">

  <!-- This is the top part of the card -->
  
  <div class="pokehead">
    <span class="blue-circle"></span>
    <span class="red-circle"></span>
<span class="yellow-circle"></span>
<span class="green-circle"></span>
</div>
  
<!-- This is middle section of the card -->
  
<div class="pokebody">
<div class="poke-gray">
<div class="circle-container">
<span class="circle"></span>
<span class="circle"></span>
</div>
<div class="poke-container" id="background">
<div class="image-container">
<img src='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png' alt='${name}'>
</div>
</div>
<div class="box-buttons">
<span class="circle2"></span>
<img src="./images/menu.png" alt="" class="burger">
</div>
</div>
</div>
  
<!-- This is the bottom part of the card -->
  
<div class="pokein">
<div class="pokename">
${name}
</div>
<button type="button" class="heartbtn">
<i class='fa fa-heart' aria-hidden='true'></i>
</button>
</div>
  
<div class="pokein2">
<div class="id">
<span class='number'>#${pokemon.id.toString().padStart(3, '0')}</span>
</div>
<div class="likeCount" id="countBox">
<span class="count" id='${pokemon.id}'> 0 </span>&nbsp; Likes
</div>
</div>
  
<button type="button" class="commentBtn" >Comments</button>

  </div>
  `;
  pokemonEl.innerHTML = pokeInnerHTML;
  pokeContainer.appendChild(pokemonEl);
}

const listComments = async(id) => {
  getComments(id).then((comments) => {
    const totalComments = document.getElementById('total-comments');
    totalComments.innerHTML = '0  Comment Count';

    document.getElementById('comments_rows').innerHTML = '';
    if (comments.length === 0) return;
    if (comments.length > 1) { totalComments.innerHTML = `${comments.length.toString()}  Comments Count`; } else { totalComments.innerHTML = `${comments.length.toString()} Comment Count`; }
    comments.forEach((comment, i) => {
      document.getElementById('comments_rows').innerHTML += `<tr>
                    <th>${i + 1}</th>
                    <th>${comment.username}</th>
                    <th>${comment.comment}</th>
                    <th>${comment.creation_date}</th>
                  </tr>`;
    });
  });
};
const updateTotalPokemons = async(done) => {
  await fetchTotalPokemons().then((max) => {
    maxPokemons = max;
    document.getElementById('totalPokemons').innerHTML = maxPokemons.toString();
    done();
  });
};

const addComment = async(id) => {
  const userName = document.getElementById('username');
  const comment = document.getElementById('comment');

  await putComment(id, userName.value, comment.value);
  userName.value = '';
  comment.value = '';
  listComments(openedOverlayID);
};
const fillOverlay = async(id) => {
  document.getElementsByClassName('overlay')[0].style.display = 'block';

  // fetch all details
  openedOverlayID = id;
  const url = `https://pokeapi.co/api/v2/pokemon/${id}`;
  const res = await fetch(url);
  const pokemon = await res.json();
  document.getElementById('pokemon_img').src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`;

  document.getElementById('pokemon_img').alt = `${pokemon.name}`;
  listComments(id);
};
window.onload = () => {
  myApp = localStorage.getItem('myApp');
  if (myApp === undefined || myApp === null) {
    // Add a new App using Involvement API
    createApp().then((appID) => {
      localStorage.setItem('myApp', appID);
      myApp = appID;
    });
  }

  updateTotalPokemons(() => {
    fetchPokemons();

    document.getElementById('prev').addEventListener('click', () => {
      if (pageNumber >= 2) {
        pageNumber -= 1;
        fetchPokemons();
      }
    });

    document.getElementById('next').addEventListener('click', () => {
      if ((maxPokemons / pokemonsNumber) > pageNumber) {
        pageNumber += 1;
        fetchPokemons();
      }
    });

    document.getElementById('addComment').addEventListener('click', () => {
      addComment(openedOverlayID);
    });

    document.getElementById('close').addEventListener('click', () => {
      openedOverlayID = 0;
      document.getElementsByClassName('overlay')[0].style.display = 'none';
    });
  });
};