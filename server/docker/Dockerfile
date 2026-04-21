FROM ubuntu:22.04

# Install compilers & runtimes
RUN apt-get update && apt-get install -y \
    python3 \
    nodejs \
    npm \
    gcc \
    g++ \
    openjdk-17-jdk \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

CMD ["bash"]