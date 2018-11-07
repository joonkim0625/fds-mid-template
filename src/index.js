import '@babel/polyfill' // 이 라인을 지우지 말아주세요!

import axios from 'axios'

const api = axios.create({
  baseURL: process.env.API_URL
})

api.interceptors.request.use(function (config) {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers = config.headers || {}
    config.headers['Authorization'] = 'Bearer ' + token
  }
  return config
});

const templates = {
  member: document.querySelector('#member').content,
  loginForm: document.querySelector('#login-form').content,
  productList: document.querySelector('#product-list').content,
  productItem: document.querySelector('#product-item').content

}

const rootEl = document.querySelector('.root')

// 페이지 그리는 함수 작성 순서
// 1. 템플릿 복사
// 2. 요소 선택
// 3. 필요한 데이터 불러오기
// 4. 내용 채우기
// 5. 이벤트 리스너 등록하기
// 6. 템플릿을 문서에 삽입

// 시작 화면 페이지
async function mainPage() {
  // 멤버 네비
  drawProductList()
}

// 멤버 버튼 모은 페이지
// const memberEl = document.querySelector('.member')

// 로그인 화면 그리는 함수
async function drawLoginForm() {
  // 1. 템플릿 복사
  const frag = document.importNode(templates.loginForm, true);

  // 2. 요소 선택
  const formEl = frag.querySelector(".login-form");

  // 3. 필요한 데이터 불러오기 - 필요없음
  // 4. 내용 채우기 - 필요없음
  // 5. 이벤트 리스너 등록하기
  formEl.addEventListener("submit", async e => {
    e.preventDefault();
    const username = e.target.elements.username.value;
    const password = e.target.elements.password.value;

    const res = await api.post("/users/login", {
      username,
      password
    });

    localStorage.setItem("token", res.data.token);
    drawProductList();
  });

  // 6. 템플릿을 문서에 삽입
  rootEl.textContent = "";
  rootEl.appendChild(frag);
}

// 상품 목록 그리는 함수
async function drawProductList() {


  // 1. 템플릿 복사
  const frag = document.importNode(templates.productList, true)


  // 2. 요소 선택
  const productListEl = frag.querySelector('.product-list')
  // 3. 필요한 데이터 불러오기
  const res = await api.get('/products')
  const productList = res.data
  // 4. 내용 채우기
  for (const product of productList) {
    const frag = document.importNode(templates.productItem, true)

    const titleEl = frag.querySelector('.product-item-title')
    // const mainImgEl = frag.querySelector('.product-item-img')
    // mainImgEl.setAttribute('src', productItem.mainImgUrl)


    titleEl.textContent = product.title
    // mainImgEl.textContent = productItem.mainImgUrl

    // 게시물(이미지) 클릭 시 세부 목록으로

    productListEl.appendChild(frag)
  }
  // 5. 이벤트 리스너 등록하기


  // 6. 템플릿을 문서에 삽입

  rootEl.textContent = ''
  rootEl.appendChild(frag)
}

// 로그인 화면 그리기
async function drawLoginForm() {
  // 1
  const frag = document.importNode(templates.loginForm, true)

  // 2
  const formEl = frag.querySelector('.login-form')

  // 5
  formEl.addEventListener('submit', async e => {
    e.preventDefault()
    const username = e.target.elements.username.value
    const password = e.target.elements.password.value

    const res = await api.post('/users/login', {
      username,
      password
    })

    localStorage.setItem('token', res.data.token)
    drawProductList()
  })

  // 6
  rootEl.textContent = "";
  rootEl.appendChild(frag);
}


mainPage()
