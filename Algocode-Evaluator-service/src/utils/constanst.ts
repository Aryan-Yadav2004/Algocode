export const PYTHON_IMAGE = 'python'
export const JAVA_IMAGE = 'openjdk:27-ea-jdk-trixie'
export const CPP_IMAGE = 'gcc:latest';

export const submission_queue = 'SubmissionQueue';
// This will represent the header size of docker stream.
// docker stream header will contain data about type of stream i.e. stdout / stderr.
// and the length of data.
export const DOCKER_STREAM_HEADER_SIZE = 8