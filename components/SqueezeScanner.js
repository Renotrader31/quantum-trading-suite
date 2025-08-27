import React, { useState, useEffect } from 'react';

const StyledSqueezeScanner = () => {
  const [symbols] = useState([
    'AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA', 'META', 'NVDA', 'NFLX',
    'AMD', 'CRM', 'ADBE', 'PYPL', 'INTC', 'CSCO', 'ORCL', 'IBM'
  ]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

 // Replace this part in the styled version:
const scanSymbols = async () => {
  setLoading(true);
  setResults([]);
  
  try {
    const results = [];
    
    for (let i = 0; i < symbols.length; i++) {
      const ticker = symbols[i];
      
      // YOUR WORKING API CALL HERE:
      const response = await fetch(`/api/whales?type=greeks&ticker=${ticker}`);
      const data = await response.json();
      
      // Process the real data and calculate squeeze metrics
      const metrics = calculateSqueezeMetrics(data.data?.data || []);
      
      results.push({
        symbol: ticker,
        score: metrics.squeezeScore,
        confidence: metrics.confidence
      });
    }
    
    setResults(results);
  } catch (error) {
    console.error('Error scanning:', error);
  } finally {
    setLoading(false);
  }
};

  // Inline styles object
  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    },
    card: {
      background: 'rgba(255, 255, 255, 0.95)',
      borderRadius: '20px',
      padding: '30px',
      maxWidth: '1200px',
      margin: '0 auto',
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.2)'
    },
    title: {
      fontSize: '2.5rem',
      fontWeight: 'bold',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      textAlign: 'center',
      marginBottom: '10px',
      textShadow: '2px 2px 4px rgba(0, 0, 0, 0.1)'
    },
    subtitle: {
      fontSize: '1.2rem',
      color: '#6b7280',
      textAlign: 'center',
      marginBottom: '30px',
      fontWeight: '300'
    },
    buttonContainer: {
      display: 'flex',
      justifyContent: 'center',
      marginBottom: '30px'
    },
    scanButton: {
      background: loading 
        ? 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)'
        : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      color: 'white',
      border: 'none',
      borderRadius: '50px',
      padding: '15px 40px',
      fontSize: '1.1rem',
      fontWeight: '600',
      cursor: loading ? 'not-allowed' : 'pointer',
      transition: 'all 0.3s ease',
      boxShadow: '0 8px 20px rgba(16, 185, 129, 0.3)',
      transform: loading ? 'scale(0.95)' : 'scale(1)',
      minWidth: '200px'
    },
    loadingContainer: {
      textAlign: 'center',
      padding: '40px'
    },
    loadingSpinner: {
      width: '50px',
      height: '50px',
      border: '4px solid #e5e7eb',
      borderTop: '4px solid #667eea',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
      margin: '0 auto 20px'
    },
    loadingText: {
      fontSize: '1.2rem',
      color: '#6b7280',
      fontWeight: '500'
    },
    statsContainer: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '20px',
      marginBottom: '30px'
    },
    statCard: {
      background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
      borderRadius: '15px',
      padding: '20px',
      textAlign: 'center',
      border: '1px solid rgba(0, 0, 0, 0.05)',
      boxShadow: '0 4px 10px rgba(0, 0, 0, 0.05)'
    },
    statNumber: {
      fontSize: '2rem',
      fontWeight: 'bold',
      color: '#374151',
      marginBottom: '5px'
    },
    statLabel: {
      fontSize: '0.9rem',
      color: '#6b7280',
      fontWeight: '500'
    },
    tableContainer: {
      background: 'white',
      borderRadius: '15px',
      overflow: 'hidden',
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
      border: '1px solid rgba(0, 0, 0, 0.05)'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse'
    },
    tableHeader: {
      background: 'linear-gradient(135deg, #374151 0%, #1f2937 100%)',
      color: 'white'
    },
    tableHeaderCell: {
      padding: '20px 15px',
      fontSize: '1rem',
      fontWeight: '600',
      textAlign: 'left',
      borderBottom: '2px solid #4b5563'
    },
    tableRow: {
      borderBottom: '1px solid #f3f4f6',
      transition: 'background-color 0.2s ease'
    },
    tableCell: {
      padding: '15px',
      fontSize: '0.95rem',
      color: '#374151'
    },
    symbolCell: {
      fontWeight: '600',
      color: '#1f2937',
      fontSize: '1rem'
    },
    scoreCell: {
      fontWeight: 'bold',
      fontSize: '1.1rem'
    },
    confidenceBadge: {
      padding: '6px 12px',
      borderRadius: '20px',
      fontSize: '0.85rem',
      fontWeight: '600',
      display: 'inline-block',
      minWidth: '60px',
      textAlign: 'center'
    },
    highConfidence: {
      background: '#dcfce7',
      color: '#166534'
    },
    mediumConfidence: {
      background: '#fef3c7',
      color: '#92400e'
    },
    lowConfidence: {
      background: '#fee2e2',
      color: '#991b1b'
    },
    noResults: {
      textAlign: 'center',
      padding: '60px 20px',
      color: '#6b7280',
      fontSize: '1.2rem',
      background: 'white',
      borderRadius: '15px',
      boxShadow: '0 4px 10px rgba(0, 0, 0, 0.05)'
    }
  };

  const getScoreColor = (score) => {
    if (score >= 70) return '#059669'; // Green
    if (score >= 40) return '#d97706'; // Orange
    return '#dc2626'; // Red
  };

  const getConfidenceStyle = (confidence) => {
    switch (confidence) {
      case 'High': return { ...styles.confidenceBadge, ...styles.highConfidence };
      case 'Medium': return { ...styles.confidenceBadge, ...styles.mediumConfidence };
      case 'Low': return { ...styles.confidenceBadge, ...styles.lowConfidence };
      default: return styles.confidenceBadge;
    }
  };

  const averageScore = results.length > 0 
    ? (results.reduce((sum, result) => sum + result.score, 0) / results.length).toFixed(1)
    : 0;

  const highScoreCount = results.filter(result => result.score >= 70).length;
  const highConfidenceCount = results.filter(result => result.confidence === 'High').length;

  return (
    <div style={styles.container}>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }

          .table-row:hover {
            background-color: #f9fafb !important;
          }

          .scan-button:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 12px 25px rgba(16, 185, 129, 0.4);
          }

          .scan-button:active:not(:disabled) {
            transform: translateY(0px);
          }
        `}
      </style>

      <div style={styles.card}>
        <h1 style={styles.title}>SqueezeScanner Pro</h1>
        <p style={styles.subtitle}>
          Advanced Stock Analysis & Squeeze Detection System
        </p>

        <div style={styles.buttonContainer}>
          <button
            onClick={scanSymbols}
            disabled={loading}
            style={styles.scanButton}
            className="scan-button"
          >
            {loading ? 'Scanning Symbols...' : 'Start Squeeze Scan'}
          </button>
        </div>

        {loading && (
          <div style={styles.loadingContainer}>
            <div style={styles.loadingSpinner}></div>
            <div style={styles.loadingText}>
              Analyzing {symbols.length} symbols for squeeze patterns...
            </div>
          </div>
        )}

        {results.length > 0 && (
          <>
            <div style={styles.statsContainer}>
              <div style={styles.statCard}>
                <div style={styles.statNumber}>{results.length}</div>
                <div style={styles.statLabel}>Symbols Scanned</div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statNumber}>{averageScore}</div>
                <div style={styles.statLabel}>Average Score</div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statNumber}>{highScoreCount}</div>
                <div style={styles.statLabel}>High Scores (70+)</div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statNumber}>{highConfidenceCount}</div>
                <div style={styles.statLabel}>High Confidence</div>
              </div>
            </div>

            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead style={styles.tableHeader}>
                  <tr>
                    <th style={styles.tableHeaderCell}>Symbol</th>
                    <th style={styles.tableHeaderCell}>Squeeze Score</th>
                    <th style={styles.tableHeaderCell}>Confidence</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((result, index) => (
                    <tr 
                      key={result.symbol} 
                      style={styles.tableRow}
                      className="table-row"
                    >
                      <td style={{...styles.tableCell, ...styles.symbolCell}}>
                        {result.symbol}
                      </td>
                      <td 
                        style={{
                          ...styles.tableCell, 
                          ...styles.scoreCell,
                          color: getScoreColor(result.score)
                        }}
                      >
                        {result.score}/100
                      </td>
                      <td style={styles.tableCell}>
                        <span style={getConfidenceStyle(result.confidence)}>
                          {result.confidence}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {!loading && results.length === 0 && (
          <div style={styles.noResults}>
            <div style={{fontSize: '3rem', marginBottom: '20px'}}>📊</div>
            <div>Click "Start Squeeze Scan" to analyze stock symbols</div>
            <div style={{fontSize: '0.9rem', marginTop: '10px', opacity: 0.7}}>
              Scanning {symbols.length} popular stock symbols for squeeze patterns
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StyledSqueezeScanner;
