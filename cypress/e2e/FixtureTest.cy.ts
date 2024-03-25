import { POPULAR_MOVIES_URL, MOVIE_SEARCH_URL } from '../../src/constants/URLs';
import IMovieData from '../../src/interfaces/IMovieData';
import IRespondData from '../../src/interfaces/FetchMovieListDTO';
import '../support/commands';

describe('Fixture를 이용한 테스트', () => {
  beforeEach(() => {
    // https://docs.cypress.io/api/commands/intercept
    cy.intercept(
      {
        method: 'GET',
        url: /^https:\/\/api\.themoviedb\.org\/3\/movie\/popular.+1$/,
      },
      { fixture: 'movie-popular-page1.json' },
    ).as('getPopularMoviesPage1');

    cy.intercept(
      {
        method: 'GET',
        url: /^https:\/\/api\.themoviedb\.org\/3\/movie\/popular.+2$/,
      },
      { fixture: 'movie-popular-page2.json' },
    ).as('getPopularMoviesPage2');

    cy.intercept(
      {
        method: 'GET',
        url: /^https:\/\/api\.themoviedb\.org\/3\/search\/movie*/,
      },
      { fixture: 'movie-search.json' },
    ).as('getSearchMovies');

    cy.visit('http://localhost:8080');
  });

  it('초기 화면에는 지금 인기 있는 영화가 20개씩 목록에 나열되어야 한다', () => {
    cy.wait('@getPopularMoviesPage1').then((interception) => {
      const popularMovies = interception.response?.body.results;
      expect(popularMovies.length).to.equal(20);

      const popularMovieItems = cy.get('.item-list > li');
      expect(popularMovieItems.should('have.length', 20));
    });
  });

  it('초기 화면에서 더 보기를 누르면 영화 20개가 추가로 나열되어야 한다.', () => {
    cy.wait('@getPopularMoviesPage1').then((interception) => {
      cy.scrollTo('bottom');
      cy.get('.btn').click();
    });
    cy.wait('@getPopularMoviesPage2').then((interception) => {
      const popularMovieItems = cy.get('.item-list > li');
      expect(popularMovieItems.should('have.length', 40));
    });
  });

  it('검색 창에 "해리 포터"를 입력 시 해리 포터 관련 영화 목록이 나타나야 한다.', () => {
    cy.wait('@getPopularMoviesPage1').then(() => {
      cy.get('input').type('해리 포터');
      cy.get('.search-button').click();
    });
    cy.wait('@getSearchMovies').then((interception) => {
      const searchedMovies: IMovieData[] = interception.response?.body.results;
      expect(searchedMovies.length).to.equal(10);
      searchedMovies.forEach((data) => expect(data.title).to.match(/^해리 포터/));
    });
  });

  it('마지막 페이지인 경우 더 보기 버튼이 사라져야 한다', () => {
    cy.wait('@getPopularMoviesPage1').then(() => {
      cy.get('input').type('해리 포터');
      cy.get('.search-button').click();
    });
    cy.wait('@getSearchMovies').then((interception) => {
      cy.scrollTo('bottom');
      cy.contains('더 보기').should('not.be.exist');
    });
  });

  it('로고 이미지 클릭 시 지금 인기 있는 영화 목록 20개를 나열해야 한다.', () => {
    cy.wait('@getPopularMoviesPage1').then(() => {
      cy.get('input').type('해리 포터');
      cy.get('.search-button').click();
    });
    cy.wait('@getSearchMovies').then(() => {
      cy.get('h1').click();
    });
    cy.wait('@getPopularMoviesPage1').then(() => {
      const popularMovieItems = cy.get('.item-list > li');
      expect(popularMovieItems.should('have.length', 20));
    });
  });
});
