# syntax=docker/dockerfile:1.7

FROM flyway/flyway:11-alpine

COPY infra/postgres/migrations /flyway/sql

CMD ["migrate"]
