package com.byteforge.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

/**
 * JWT utility service â€” the single place responsible for token operations.
 *
 * JJWT 0.12.x API notes (differs from the older 0.9.x tutorials you'll find online):
 *   - Jwts.builder() uses .subject() not .setSubject()
 *   - Jwts.parser() uses .verifyWith() not .setSigningKey()
 *   - .parseSignedClaims() replaces .parseClaimsJws()
 *   - .getPayload() replaces .getBody()
 *
 * JWT structure recap:  header.payload.signature
 *   Header  â€” algorithm (HS256) and token type
 *   Payload â€” claims: sub (email), iat (issued at), exp (expiry), role
 *   Signature â€” HMAC-SHA256(base64(header) + "." + base64(payload), secret)
 */
@Service
public class JwtService {

    /** Read from application.properties â†’ ${jwt.secret} â†’ .env */
    @Value("${jwt.secret}")
    private String secretKey;

    /** Read from application.properties â†’ ${jwt.expiration.ms} */
    @Value("${jwt.expiration.ms}")
    private long jwtExpirationMs;

    // â”€â”€â”€ Public API â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    /**
     * Generates a token for the given user with default claims only.
     * Convenience overload â€” calls generateToken(extraClaims, userDetails).
     */
    public String generateToken(UserDetails userDetails) {
        return generateToken(new HashMap<>(), userDetails);
    }

    /**
     * Generates a JWT token.
     *
     * @param extraClaims any additional claims to embed (e.g., role)
     * @param userDetails the authenticated user (getUsername() â†’ email)
     * @return signed compact JWT string
     */
    public String generateToken(Map<String, Object> extraClaims, UserDetails userDetails) {
        return Jwts.builder()
                .claims(extraClaims)                              // custom claims first
                .subject(userDetails.getUsername())               // "sub" = email
                .issuedAt(new Date(System.currentTimeMillis()))   // "iat"
                .expiration(new Date(System.currentTimeMillis() + jwtExpirationMs)) // "exp"
                .signWith(getSigningKey())                        // HMAC-SHA256 auto-selected
                .compact();
    }

    /**
     * Validates a token against the provided UserDetails.
     * Returns true only if the token is not expired AND the subject matches.
     */
    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return username.equals(userDetails.getUsername()) && !isTokenExpired(token);
    }

    /**
     * Extracts the "sub" claim (email) from the token.
     * This is what the JwtAuthenticationFilter uses to identify the user.
     */
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    // â”€â”€â”€ Private helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    /**
     * Generic claim extractor â€” takes a function that maps Claims â†’ T.
     * Example: extractClaim(token, Claims::getSubject)
     */
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    /**
     * Parses and verifies the token signature, returning all claims.
     * Throws JwtException (ExpiredJwtException, MalformedJwtException, etc.)
     * if the token is invalid â€” Spring Security catches these automatically.
     */
    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())   // verify signature with our secret
                .build()
                .parseSignedClaims(token)      // parse + verify in one step
                .getPayload();                 // returns the claims map
    }

    /**
     * Decodes the Base64-encoded secret from .env and converts it to an
     * HMAC-SHA SecretKey. Keys.hmacShaKeyFor() ensures the key is strong
     * enough for HS256 (needs â‰¥ 256 bits = 32 bytes).
     */
    private SecretKey getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}

