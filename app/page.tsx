"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { Search, User, Home, MapPin, Users, CreditCard } from "lucide-react";
import HighlightedText from "@/components/HighlightedText";

interface Voter {
  id: number;
  serial: number;
  name_en: string;
  name_ml: string;
  guardian_en: string;
  guardian_ml: string;
  house_no: string;
  house_name_en: string;
  house_name_ml: string;
  gender: string;
  age: number;
  voter_id: string;
  ward: string;
  ward_name: string;
  polling_station: string;
  district: string;
  local_body: string;
}


export default function VoterSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Voter[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const isFetching = useRef(false);

  const search = useCallback(
    async (pageNum: number = 1, append = false) => {
      if (!query.trim() || isFetching.current) return;

      isFetching.current = true;
      const setLoading = append ? setIsLoadingMore : setIsSearching;
      setLoading(true);

      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(query)}&page=${pageNum}&limit=20`
        );
        const data = await res.json();

        if (append) {
          setResults((prev) => [...prev, ...data.results]);
          setHasMore(data.hasMore ?? data.results.length === 20); // 🔥 FIX
        } else {
          setResults(data.results || []);
          setTotalResults(data.total || 0);
          setPage(data.page || 1);
          setHasMore(data.hasMore ?? data.results.length === 20);
        }
      } catch (error) {
        console.error(error);
        if (!append) {
          setResults([]);
          setTotalResults(0);
        }
      } finally {
        setLoading(false);
        isFetching.current = false;
      }
    },
    [query]
  );

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setTotalResults(0);
      setPage(1);
      return;
    }

    const timer = setTimeout(() => search(1, false), 400);
    return () => clearTimeout(timer);
  }, [query, search]);

  const loadMore = () => {
    if (hasMore && !isLoadingMore) {
      search(page + 1, true);
      setPage((p) => p + 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-md border-b-4 border-indigo-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-3 rounded-lg">
              <Users className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Voter Information Portal
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Search and verify voter registration details
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Box */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
              Find Voter Information
            </h2>
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Enter name, voter ID, or house number..."
                  className="w-full px-5 py-4 pl-12 text-lg text-gray-800 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              </div>
              <button
                onClick={() => search(1, false)}
                disabled={isSearching || !query.trim()}
                className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 shadow-lg transition-all"
              >
                {isSearching ? "Searching..." : "Search"}
              </button>
            </div>
          </div>
        </div>

        {/* Results Header */}
        {results.length > 0 && (
          <div className="mb-6 text-center">
            <h3 className="text-2xl font-bold text-gray-800">
              Found{" "}
              <span className="text-indigo-600 text-3xl">
                {totalResults.toLocaleString()}
              </span>{" "}
              voter
              {totalResults !== 1 ? "s" : ""}
            </h3>
       
          </div>
        )}

        {/* Results Grid - Your Original Beautiful Style */}
        {results.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2">
            {results.map((voter) => (
              <div
                key={voter.voter_id}
                className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-indigo-300"
              >
                {/* Gradient Header */}
                <div className="bg-gradient-to-br from-indigo-500 to-purple-500 px-6 py-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-xl font-bold text-white mb-1">
                        <HighlightedText
                          text={voter.name_en}
                          highlight={query}
                        />
                      </h4>
                      <p className="text-indigo-100 text-sm font-medium">
                        <HighlightedText
                          text={voter.name_ml}
                          highlight={query}
                        />
                      </p>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2">
                      <p className="text-white text-xs font-semibold">Serial</p>
                      <p className="text-white text-lg font-bold">
                        {voter.serial}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6 space-y-4">
                  {/* Voter ID */}
                  <div className="flex items-start gap-3 text-gray-700 bg-indigo-50 p-3 rounded-lg border-2 border-indigo-200">
                    <div className="bg-indigo-600 p-2 rounded-lg mt-1 shrink-0">
                      <CreditCard className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-indigo-600 uppercase font-bold">
                        Voter ID
                      </p>
                      <p className="font-mono font-bold text-lg text-indigo-900 break-all">
                        <HighlightedText
                          text={voter.voter_id}
                          highlight={query}
                        />
                      </p>
                    </div>
                  </div>

                  {/* Polling Station */}
                  <div className="flex items-start gap-3 text-gray-700 bg-blue-50 p-3 rounded-lg border-2 border-blue-200">
                    <div className="bg-blue-600 p-2 rounded-lg mt-1 shrink-0">
                      <MapPin className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-blue-600 uppercase font-bold">
                        Polling Station
                      </p>
                      <p className="font-semibold text-base text-blue-900">
                        <HighlightedText
                          text={voter.polling_station}
                          highlight={query}
                        />
                      </p>
                    </div>
                  </div>

                  {/* House */}
                  <div className="flex items-start gap-3 text-gray-700 bg-green-50 p-3 rounded-lg border border-green-200">
                    <div className="bg-green-600 p-2 rounded-lg mt-1 shrink-0">
                      <Home className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-green-600 uppercase font-bold">
                        House No. & Name
                      </p>
                      <p className="font-bold text-base text-green-700">
                        <HighlightedText
                          text={voter.house_no}
                          highlight={query}
                        />
                      </p>
                      <p className="font-medium text-sm mt-1">
                        <HighlightedText
                          text={voter.house_name_en}
                          highlight={query}
                        />
                      </p>
                      <p className="text-sm text-gray-600">
                        <HighlightedText
                          text={voter.house_name_ml}
                          highlight={query}
                        />
                      </p>
                    </div>
                  </div>

                  {/* Grid Layout */}
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="flex items-start gap-3 text-gray-700">
                      <div className="bg-pink-100 p-2 rounded-lg mt-1 shrink-0">
                        <User className="w-4 h-4 text-pink-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase font-semibold">
                          Gender & Age
                        </p>
                        <p className="font-medium text-sm">
                          {voter.gender} • {voter.age} years
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 text-gray-700">
                      <div className="bg-orange-100 p-2 rounded-lg mt-1 shrink-0">
                        <MapPin className="w-4 h-4 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase font-semibold">
                          Ward
                        </p>
                        <p className="font-semibold text-sm">
                          {voter.ward} - {voter.ward_name}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 text-gray-700">
                      <div className="bg-purple-100 p-2 rounded-lg mt-1 shrink-0">
                        <Users className="w-4 h-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase font-semibold">
                          Guardian
                        </p>
                        <p className="font-medium text-sm">
                          <HighlightedText
                            text={voter.guardian_en}
                            highlight={query}
                          />
                        </p>
                        <p className="text-sm text-gray-600">
                          <HighlightedText
                            text={voter.guardian_ml}
                            highlight={query}
                          />
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 text-gray-700">
                      <div className="bg-teal-100 p-2 rounded-lg mt-1 shrink-0">
                        <MapPin className="w-4 h-4 text-teal-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase font-semibold">
                          District & Local Body
                        </p>
                        <p className="font-medium text-sm">{voter.district}</p>
                        <p className="text-sm text-gray-600">
                          {voter.local_body}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {results.length > 0 && hasMore && (
          <div className="flex justify-center mt-12">
            <button
              onClick={loadMore}
              disabled={isLoadingMore}
              className="px-10 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-lg rounded-xl hover:from-indigo-700 hover:to-purple-700 disabled:opacity-70 disabled:cursor-not-allowed transition-all flex items-center gap-3 shadow-lg hover:shadow-xl"
            >
              {isLoadingMore ? (
                <>
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Loading More...
                </>
              ) : (
                <>
                  <span>Load More Results</span>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </>
              )}
            </button>
          </div>
        )}

        {/* Optional: Show "End of results" message when done */}
        {results.length > 0 && !hasMore && totalResults > 20 && (
          <div className="text-center mt-10 text-gray-600">
            <p className="text-lg">
              You&apos;ve viewed all <strong>{totalResults.toLocaleString()}</strong>{" "}
              matching voters
            </p>
          </div>
        )}
        {/* States */}
        {isSearching && results.length === 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-6 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <h3 className="text-xl font-semibold text-gray-800">
              Searching...
            </h3>
          </div>
        )}

        {results.length === 0 && query && !isSearching && (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              No Results Found
            </h3>
            <p className="text-gray-600">
              Try a different name, voter ID, or house number
            </p>
          </div>
        )}

        {!query && (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="bg-gradient-to-br from-indigo-100 to-purple-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-10 h-10 text-indigo-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Ready to Search
            </h3>
            <p className="text-gray-600">
              Enter a name or voter ID to find voter details
            </p>
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center text-sm text-gray-600">
          © 2025 Voter Information Portal. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
