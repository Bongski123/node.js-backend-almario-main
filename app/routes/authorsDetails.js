import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const AuthorDetails = () => {
  const { id } = useParams();
  const [author, setAuthor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch author details when component mounts
    axios.get(`http://localhost:9001/author/${id}`)
      .then(response => {
        setAuthor(response.data);
        setLoading(false);
      })
      .catch(error => {
        setError('Error fetching author details');
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!author) {
    return <div>Author not found</div>;
  }

  return (
    <div>
      <h1>Author Details</h1>
      <p><strong>ID:</strong> {author.id}</p>
      <p><strong>Name:</strong> {author.firstName} {author.lastName}</p>
      {/* Add more details as needed */}
    </div>
  );
};

export default AuthorDetails;
