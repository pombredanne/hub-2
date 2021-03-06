import classnames from 'classnames';
import every from 'lodash/every';
import isEmpty from 'lodash/isEmpty';
import isNull from 'lodash/isNull';
import isUndefined from 'lodash/isUndefined';
import React, { Dispatch, SetStateAction, useContext, useEffect, useState } from 'react';
import { FaFilter } from 'react-icons/fa';
import { IoMdCloseCircleOutline } from 'react-icons/io';
import { useHistory } from 'react-router-dom';

import { API } from '../../api';
import { AppCtx, updateLimit } from '../../context/AppCtx';
import useScrollRestorationFix from '../../hooks/useScrollRestorationFix';
import { Facets, Package, RepositoryKind, SearchFiltersURL, SearchResults } from '../../types';
import prepareQueryString from '../../utils/prepareQueryString';
import Loading from '../common/Loading';
import NoData from '../common/NoData';
import PackageCard from '../common/PackageCard';
import Pagination from '../common/Pagination';
import SampleQueries from '../common/SampleQueries';
import Sidebar from '../common/Sidebar';
import SubNavbar from '../navigation/SubNavbar';
import Filters from './Filters';
import PaginationLimit from './PaginationLimit';
import styles from './SearchView.module.css';

interface FiltersProp {
  [key: string]: string[];
}

interface Props {
  isSearching: boolean;
  setIsSearching: Dispatch<SetStateAction<boolean>>;
  scrollPosition?: number;
  setScrollPosition: Dispatch<SetStateAction<number | undefined>>;
  tsQueryWeb?: string;
  tsQuery?: string[];
  pageNumber: number;
  filters: FiltersProp;
  deprecated?: boolean | null;
  operators?: boolean | null;
  verifiedPublisher?: boolean | null;
  official?: boolean | null;
  fromDetail: boolean;
}

const SearchView = (props: Props) => {
  const { ctx, dispatch } = useContext(AppCtx);
  const history = useHistory();
  const [searchResults, setSearchResults] = useState<SearchResults>({
    data: {
      facets: null,
      packages: null,
    },
    metadata: {
      offset: 0,
      total: 0,
      limit: ctx.prefs.search.limit,
    },
  });
  const { isSearching, setIsSearching, scrollPosition, setScrollPosition } = props;
  const [apiError, setApiError] = useState<string | null>(null);

  const isEmptyFacets = (): boolean => {
    if (isNull(searchResults.data.facets)) {
      return true;
    } else {
      return every(searchResults.data.facets, (f: Facets) => {
        return f.options.length === 0;
      });
    }
  };

  useScrollRestorationFix();

  const saveScrollPosition = () => {
    setScrollPosition(window.scrollY);
  };

  const updateWindowScrollPosition = (newPosition: number) => {
    window.scrollTo(0, newPosition);
  };

  const prepareSelectedFilters = (name: string, newFilters: string[], prevFilters: FiltersProp): FiltersProp => {
    let cleanFilters: FiltersProp = {};
    switch (name) {
      case 'kind':
        // Remove selected chart repositories when some kind different to Chart is selected and Chart is not selected
        if (newFilters.length > 0 && !newFilters.includes(RepositoryKind.Helm.toString())) {
          cleanFilters['repo'] = [];
        }
        break;
    }

    return {
      ...prevFilters,
      [name]: newFilters,
      ...cleanFilters,
    };
  };

  const getCurrentFilters = (): SearchFiltersURL => {
    return {
      pageNumber: props.pageNumber,
      tsQueryWeb: props.tsQueryWeb,
      tsQuery: props.tsQuery,
      filters: props.filters,
      deprecated: props.deprecated,
      operators: props.operators,
      verifiedPublisher: props.verifiedPublisher,
      official: props.official,
    };
  };

  const onFiltersChange = (name: string, value: string, checked: boolean): void => {
    let newFilters = isUndefined(props.filters[name]) ? [] : props.filters[name].slice();
    if (checked) {
      newFilters.push(value);
    } else {
      newFilters = newFilters.filter((el) => el !== value);
    }

    history.push({
      pathname: '/packages/search',
      search: prepareQueryString({
        ...getCurrentFilters(),
        pageNumber: 1,
        filters: prepareSelectedFilters(name, newFilters, props.filters),
      }),
    });
  };

  const onResetSomeFilters = (filterKeys: string[]): void => {
    let newFilters: FiltersProp = {};
    filterKeys.forEach((fKey: string) => {
      newFilters[fKey] = [];
    });

    history.push({
      pathname: '/packages/search',
      search: prepareQueryString({
        ...getCurrentFilters(),
        pageNumber: 1,
        filters: { ...props.filters, ...newFilters },
      }),
    });
  };

  const onTsQueryChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { value, checked } = e.target;
    let query = isUndefined(props.tsQuery) ? [] : props.tsQuery.slice();
    if (checked) {
      query.push(value);
    } else {
      query = query.filter((el) => el !== value);
    }

    history.push({
      pathname: '/packages/search',
      search: prepareQueryString({
        ...getCurrentFilters(),
        pageNumber: 1,
        tsQuery: query,
      }),
    });
  };

  const onDeprecatedChange = (): void => {
    history.push({
      pathname: '/packages/search',
      search: prepareQueryString({
        ...getCurrentFilters(),
        pageNumber: 1,
        deprecated: !isUndefined(props.deprecated) && !isNull(props.deprecated) ? !props.deprecated : true,
      }),
    });
  };

  const onOperatorsChange = (): void => {
    history.push({
      pathname: '/packages/search',
      search: prepareQueryString({
        ...getCurrentFilters(),
        pageNumber: 1,
        operators: !isUndefined(props.operators) && !isNull(props.operators) ? !props.operators : true,
      }),
    });
  };

  const onVerifiedPublisherChange = (): void => {
    history.push({
      pathname: '/packages/search',
      search: prepareQueryString({
        ...getCurrentFilters(),
        pageNumber: 1,
        verifiedPublisher:
          !isUndefined(props.verifiedPublisher) && !isNull(props.verifiedPublisher) ? !props.verifiedPublisher : true,
      }),
    });
  };

  const onOfficialChange = (): void => {
    history.push({
      pathname: '/packages/search',
      search: prepareQueryString({
        ...getCurrentFilters(),
        pageNumber: 1,
        official: !isUndefined(props.official) && !isNull(props.official) ? !props.official : true,
      }),
    });
  };

  const onResetFilters = (): void => {
    history.push({
      pathname: '/packages/search',
      search: prepareQueryString({
        pageNumber: 1,
        tsQueryWeb: props.tsQueryWeb,
        tsQuery: [],
        filters: {},
      }),
    });
  };

  const onPageNumberChange = (pageNumber: number): void => {
    history.push({
      pathname: '/packages/search',
      search: prepareQueryString({
        ...getCurrentFilters(),
        pageNumber: pageNumber,
      }),
    });
  };

  const onPaginationLimitChange = (newLimit: number): void => {
    history.replace({
      pathname: '/packages/search',
      search: prepareQueryString({
        ...getCurrentFilters(),
        pageNumber: 1,
      }),
    });
    setScrollPosition(0);
    updateWindowScrollPosition(0);
    dispatch(updateLimit(newLimit));
  };

  useEffect(() => {
    async function fetchSearchResults() {
      setIsSearching(true);
      const query = {
        tsQueryWeb: props.tsQueryWeb,
        tsQuery: props.tsQuery,
        filters: props.filters,
        offset: (props.pageNumber - 1) * ctx.prefs.search.limit,
        limit: ctx.prefs.search.limit,
        deprecated: props.deprecated,
        operators: props.operators,
        verifiedPublisher: props.verifiedPublisher,
        official: props.official,
      };

      try {
        let newSearchResults = await API.searchPackages(query);
        if (newSearchResults.metadata.total === 0 && !isEmpty(searchResults.data.facets)) {
          newSearchResults = {
            ...newSearchResults,
            data: {
              ...newSearchResults.data,
              facets: searchResults.data.facets,
            },
          };
        }
        setSearchResults({ ...newSearchResults });
        setApiError(null);

        // Preload next page if required
        if (newSearchResults.metadata.total > ctx.prefs.search.limit + newSearchResults.metadata.offset) {
          API.searchPackages({
            ...query,
            offset: props.pageNumber * ctx.prefs.search.limit,
          });
        }
      } catch {
        setSearchResults({
          data: {
            facets: [],
            packages: [],
          },
          metadata: {
            total: 0,
            offset: 0,
            limit: 0,
          },
        });
        setApiError('An error occurred searching packages, please try again later.');
      } finally {
        setIsSearching(false);
        // Update scroll position
        if (history.action === 'PUSH') {
          // When search page is open from detail page
          if (props.fromDetail && !isUndefined(scrollPosition)) {
            updateWindowScrollPosition(scrollPosition);
            // When search has changed
          } else {
            updateWindowScrollPosition(0);
          }
          // On pop action and when scroll position has been previously saved
        } else if (!isUndefined(scrollPosition)) {
          updateWindowScrollPosition(scrollPosition);
        }
      }
    }
    fetchSearchResults();

    // prettier-ignore
    /* eslint-disable react-hooks/exhaustive-deps */
  }, [
    props.tsQueryWeb,
    JSON.stringify(props.tsQuery),
    props.pageNumber,
    JSON.stringify(props.filters), // https://twitter.com/dan_abramov/status/1104414272753487872
    props.deprecated,
    props.operators,
    props.verifiedPublisher,
    props.official,
    ctx.prefs.search.limit,
  ]);
  /* eslint-enable react-hooks/exhaustive-deps */

  const activeFilters =
    props.deprecated ||
    props.operators ||
    props.verifiedPublisher ||
    props.official ||
    !isUndefined(props.tsQuery) ||
    !isEmpty(props.filters);

  return (
    <>
      <SubNavbar>
        <div className="d-flex align-items-center text-truncate">
          {!isNull(searchResults.data.packages) && (
            <>
              {/* Mobile filters */}
              {!isEmptyFacets() && (
                <Sidebar
                  className="d-inline-block d-md-none mr-2"
                  wrapperClassName="px-4"
                  buttonType={classnames('btn-sm rounded-circle position-relative', styles.btnMobileFilters, {
                    [styles.filtersBadge]: activeFilters,
                  })}
                  buttonIcon={<FaFilter />}
                  closeButton={
                    <>
                      {isSearching ? (
                        <>
                          <span className="spinner-grow spinner-grow-sm" role="status" aria-hidden="true" />
                          <span className="ml-2">Loading...</span>
                        </>
                      ) : (
                        <>See {searchResults.metadata.total} results</>
                      )}
                    </>
                  }
                  leftButton={
                    <>
                      <div className="d-flex align-items-center">
                        <IoMdCloseCircleOutline className={`text-secondary ${styles.resetBtnDecorator}`} />
                        <button className="btn btn-link btn-sm p-0 pl-1 text-secondary" onClick={onResetFilters}>
                          Reset
                        </button>
                      </div>
                    </>
                  }
                  header={<div className="h6 text-uppercase mb-0 flex-grow-1">Filters</div>}
                >
                  <Filters
                    facets={searchResults.data.facets}
                    activeFilters={props.filters}
                    activeTsQuery={props.tsQuery}
                    onChange={onFiltersChange}
                    onResetSomeFilters={onResetSomeFilters}
                    onTsQueryChange={onTsQueryChange}
                    deprecated={props.deprecated}
                    operators={props.operators}
                    verifiedPublisher={props.verifiedPublisher}
                    official={props.official}
                    onDeprecatedChange={onDeprecatedChange}
                    onOperatorsChange={onOperatorsChange}
                    onVerifiedPublisherChange={onVerifiedPublisherChange}
                    onOfficialChange={onOfficialChange}
                    onResetFilters={onResetFilters}
                    visibleTitle={false}
                  />
                </Sidebar>
              )}

              {!isSearching && (
                <div data-testid="resultsText" className="text-truncate">
                  {searchResults.metadata.total > 0 && (
                    <span className="pr-1">
                      {searchResults.metadata.offset + 1} -{' '}
                      {searchResults.metadata.total < ctx.prefs.search.limit * props.pageNumber
                        ? searchResults.metadata.total
                        : ctx.prefs.search.limit * props.pageNumber}{' '}
                      <span className="ml-1">of</span>{' '}
                    </span>
                  )}
                  {searchResults.metadata.total}
                  <span className="pl-1"> results </span>
                  {!isUndefined(props.tsQueryWeb) && props.tsQueryWeb !== '' && (
                    <span className="d-none d-sm-inline pl-1">
                      for "<span className="font-weight-bold">{props.tsQueryWeb}</span>"
                    </span>
                  )}
                  {activeFilters && <small className="font-italic ml-1"> (some filters applied)</small>}
                </div>
              )}
            </>
          )}
        </div>

        <div className="ml-3">
          <PaginationLimit
            limit={ctx.prefs.search.limit}
            updateLimit={onPaginationLimitChange}
            disabled={isNull(searchResults.data.packages) || searchResults.data.packages.length === 0}
          />
        </div>
      </SubNavbar>

      <div className="d-flex position-relative pt-3 pb-3 flex-grow-1">
        {(isSearching || isNull(searchResults.data.packages)) && <Loading className="position-fixed" />}

        <main role="main" className="container d-flex flex-row justify-content-between">
          {!isEmptyFacets() && (
            <nav className={`d-none d-md-block ${styles.sidebar}`}>
              <div className="mr-5">
                <Filters
                  facets={searchResults.data.facets}
                  activeFilters={props.filters}
                  activeTsQuery={props.tsQuery}
                  onChange={onFiltersChange}
                  onResetSomeFilters={onResetSomeFilters}
                  onTsQueryChange={onTsQueryChange}
                  deprecated={props.deprecated}
                  operators={props.operators}
                  verifiedPublisher={props.verifiedPublisher}
                  official={props.official}
                  onDeprecatedChange={onDeprecatedChange}
                  onOperatorsChange={onOperatorsChange}
                  onVerifiedPublisherChange={onVerifiedPublisherChange}
                  onOfficialChange={onOfficialChange}
                  onResetFilters={onResetFilters}
                  visibleTitle
                />
              </div>
            </nav>
          )}

          <div
            className={classnames('flex-grow-1 mt-3', styles.list, {
              [styles.emptyList]: isNull(searchResults.data.packages) || searchResults.data.packages.length === 0,
            })}
          >
            {!isNull(searchResults.data.packages) && (
              <>
                {searchResults.data.packages.length === 0 ? (
                  <NoData issuesLinkVisible={!isNull(apiError)}>
                    {isNull(apiError) ? (
                      <>
                        We're sorry!
                        <p className={`h6 mb-0 mt-3 ${styles.noDataMessage}`}>
                          <span> We can't seem to find any packages that match your search </span>
                          {!isUndefined(props.tsQueryWeb) && (
                            <span className="pl-1">
                              for "<span className="font-weight-bold">{props.tsQueryWeb}</span>"
                            </span>
                          )}
                          {!isEmpty(props.filters) && <span className="pl-1">with the selected filters</span>}
                        </p>
                        <p className={`h6 mb-0 mt-5 ${styles.noDataMessage}`}>
                          You can{' '}
                          {!isEmpty(props.filters) ? (
                            <button
                              data-testid="resetLink"
                              className="btn btn-link text-secondary font-weight-bold py-0 pb-1 px-0"
                              onClick={onResetFilters}
                            >
                              <u>reset the filters</u>
                            </button>
                          ) : (
                            <button
                              data-testid="resetLink"
                              className="btn btn-link text-secondary font-weight-bold py-0 pb-1 px-0"
                              onClick={() => {
                                history.push({
                                  pathname: '/packages/search',
                                  search: prepareQueryString({
                                    pageNumber: 1,
                                    tsQueryWeb: '',
                                    tsQuery: [],
                                    filters: {},
                                  }),
                                });
                              }}
                            >
                              <u>browse all packages</u>
                            </button>
                          )}
                          , try a new search or start with one of the sample queries:
                        </p>
                        <div className="h5 d-flex flex-row align-items-end justify-content-center flex-wrap">
                          <SampleQueries className="badge-light border-secondary text-secondary" />
                        </div>
                      </>
                    ) : (
                      <>{apiError}</>
                    )}
                  </NoData>
                ) : (
                  <>
                    <div className="row mb-2">
                      {searchResults.data.packages.map((item: Package) => (
                        <PackageCard
                          key={item.packageId}
                          package={item}
                          searchUrlReferer={{
                            tsQueryWeb: props.tsQueryWeb,
                            tsQuery: props.tsQuery,
                            pageNumber: props.pageNumber,
                            filters: props.filters,
                            deprecated: props.deprecated,
                            operators: props.operators,
                            verifiedPublisher: props.verifiedPublisher,
                            official: props.official,
                          }}
                          saveScrollPosition={saveScrollPosition}
                          visibleSignedBadge
                        />
                      ))}
                    </div>

                    <Pagination
                      limit={ctx.prefs.search.limit}
                      offset={searchResults.metadata.offset}
                      total={searchResults.metadata.total}
                      active={props.pageNumber}
                      onChange={onPageNumberChange}
                    />
                  </>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </>
  );
};

export default SearchView;
